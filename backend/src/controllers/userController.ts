/**
 * User Controller
 * 
 * SECURITY OVERVIEW:
 * - All endpoints require authentication
 * - Input validation via middleware
 * - Search query sanitization to prevent ReDoS/NoSQL injection
 * - Limited user data exposed in responses
 * 
 * OWASP Alignment:
 * - A03:2021 Injection Prevention
 * - A01:2021 Broken Access Control
 */

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// @desc    Update current user profile
// @route   PUT /api/v1/users/me
// @access  Private
// SECURITY: Users can only update their own profile (enforced by using req.user._id)
export const updateMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { name, bio } = req.body;

        // SECURITY: Build update object with only allowed fields
        // This prevents mass assignment attacks even if validation is bypassed
        const updateData: { name?: string; bio?: string } = {};
        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (bio !== undefined) {
            updateData.bio = bio.trim();
        }

        // SECURITY: Update only the authenticated user's document
        // Using req.user._id ensures users cannot modify other users' data
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search users
// @route   GET /api/v1/users?search=
// @access  Private
// SECURITY: Requires authentication to prevent public user enumeration
export const searchUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { search } = req.query;

        // Build query
        let query = {};
        if (search && typeof search === 'string' && search.trim()) {
            // SECURITY: The search term is already sanitized by the validation middleware
            // which escapes regex special characters to prevent ReDoS attacks
            // and limits the query length to prevent DoS
            const searchRegex = new RegExp(search.trim(), 'i');
            query = {
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            };
        }

        // SECURITY: Only return non-sensitive fields
        // Password, tokens, and other sensitive data are excluded
        const users = await User.find(query)
            .select('name email role bio createdAt')
            .limit(20) // SECURITY: Limit results to prevent data scraping
            .sort({ name: 1 });

        const formattedUsers = users.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
            createdAt: user.createdAt,
        }));

        res.status(200).json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers,
        });
    } catch (error) {
        next(error);
    }
};

