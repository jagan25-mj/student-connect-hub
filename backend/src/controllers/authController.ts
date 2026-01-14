/**
 * Authentication Controller
 * 
 * SECURITY OVERVIEW:
 * - Password hashing with bcrypt (handled in User model)
 * - JWT tokens for stateless authentication
 * - Generic error messages to prevent user enumeration
 * - Secure password reset with hashed tokens
 * - Email verification tokens
 * 
 * OWASP Alignment:
 * - A02:2021 Cryptographic Failures (secure password storage)
 * - A07:2021 Identification and Authentication Failures
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';

// Environment detection for conditional logging
const isProduction = process.env.NODE_ENV === 'production';

// Extend Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // SECURITY: Check if user already exists
        // Using generic messages helps, but email check still reveals existence
        // Consider implementing account enumeration protection if needed
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'Email already registered',
            });
            return;
        }

        // SECURITY: Generate cryptographically secure email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Create user (password is hashed in the User model pre-save hook)
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            emailVerificationToken,
            isEmailVerified: false,
        });

        // SECURITY: Only log verification tokens in development
        // In production, these should be sent via email
        if (!isProduction) {
            console.log(`[Email Verification] Token for ${email}: ${emailVerificationToken}`);
            console.log(`[Email Verification] Link: http://localhost:5173/verify-email/${emailVerificationToken}`);
        }

        // Generate JWT token for immediate login
        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            token,
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

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input (also validated by middleware)
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide email and password',
            });
            return;
        }

        // SECURITY: Find user and include password for comparison
        // Password is excluded by default in the User model for security
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            // SECURITY: Use generic error message to prevent user enumeration
            // Attacker cannot determine if email exists based on response
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // SECURITY: Compare password using bcrypt (timing-safe comparison)
        // bcrypt.compare is designed to be constant-time to prevent timing attacks
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // SECURITY: Same error message as user-not-found to prevent enumeration
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            token,
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

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
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

// @desc    Forgot password - send reset token
// @route   POST /api/v1/auth/forgot-password
// @access  Public
// SECURITY: Rate limited at route level to prevent abuse
export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // SECURITY: Always return success to prevent user enumeration
            // Attacker cannot determine if email exists in the system
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
            return;
        }

        // SECURITY: Generate cryptographically secure reset token (256 bits)
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Token expires in 1 hour to limit window of opportunity
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

        // SECURITY: Store only the hash of the token in the database
        // If database is compromised, attacker cannot use the hashed tokens
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.passwordResetExpires = resetExpires;
        await user.save({ validateBeforeSave: false });

        // Log the reset token (in production, send email)
        console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
        console.log(`[Password Reset] Link: http://localhost:5173/reset-password/${resetToken}`);

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password with token
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        }).select('+passwordResetToken +passwordResetExpires');

        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token',
            });
            return;
        }

        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email with token
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
        }).select('+emailVerificationToken');

        if (!user) {
            res.status(400).json({
                success: false,
                error: 'Invalid verification token',
            });
            return;
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
        });
    } catch (error) {
        next(error);
    }
};

