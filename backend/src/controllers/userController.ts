import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// @desc    Update current user profile
// @route   PUT /api/v1/users/me
// @access  Private
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

        // Build update object - only include fields that are provided
        const updateData: { name?: string; bio?: string } = {};
        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (bio !== undefined) {
            updateData.bio = bio.trim();
        }

        // Update user
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
            const searchRegex = new RegExp(search.trim(), 'i');
            query = {
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            };
        }

        const users = await User.find(query)
            .select('name email role bio createdAt')
            .limit(20)
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
