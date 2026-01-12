import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';

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

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'Email already registered',
            });
            return;
        }

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            emailVerificationToken,
            isEmailVerified: false,
        });

        // Log the verification token (in production, send email)
        console.log(`[Email Verification] Token for ${email}: ${emailVerificationToken}`);
        console.log(`[Email Verification] Link: http://localhost:5173/verify-email/${emailVerificationToken}`);

        // Generate token
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

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Please provide email and password',
            });
            return;
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
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
export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save hashed token to database
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

