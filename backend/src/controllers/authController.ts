import { Request, Response, NextFunction } from 'express';
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

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
        });

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
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
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
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
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
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};
