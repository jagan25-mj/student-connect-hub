import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { verifyToken } from '../utils/jwt';

// Extend Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

// Protect routes - verify JWT token
export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Get token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
            });
            return;
        }

        try {
            // Verify token
            const decoded = verifyToken(token);

            // Get user from token
            const user = await User.findById(decoded.userId);

            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'User not found',
                });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
            });
            return;
        }
    } catch (error) {
        next(error);
    }
};

// Admin only middleware
export const adminOnly = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Not authenticated',
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
        return;
    }

    next();
};
