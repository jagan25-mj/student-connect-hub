/**
 * Authentication Middleware
 * 
 * SECURITY OVERVIEW:
 * - JWT token verification for protected routes
 * - User lookup to ensure account still exists
 * - Role-based access control for admin endpoints
 * - Generic error messages to prevent information disclosure
 * 
 * OWASP Alignment:
 * - A01:2021 Broken Access Control
 * - A07:2021 Identification and Authentication Failures
 */

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

// ============================================================
// JWT Authentication Middleware
// ============================================================

/**
 * SECURITY: Protects routes by requiring valid JWT authentication
 * 
 * Flow:
 * 1. Extract token from Authorization header (Bearer scheme)
 * 2. Verify token signature and expiration
 * 3. Look up user in database to ensure they still exist
 * 4. Attach user to request for downstream handlers
 */
export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // SECURITY: Extract token from Authorization header
        // Expected format: "Bearer <token>"
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // SECURITY: Reject requests without a token
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route',
            });
            return;
        }

        try {
            // SECURITY: Verify token signature and expiration
            // This throws if token is invalid, expired, or tampered with
            const decoded = verifyToken(token);

            // SECURITY: Look up user to ensure account still exists
            // This handles cases where user was deleted after token was issued
            const user = await User.findById(decoded.userId);

            if (!user) {
                // SECURITY: Generic message prevents user enumeration
                res.status(401).json({
                    success: false,
                    error: 'User not found',
                });
                return;
            }

            // Attach user to request for use in route handlers
            req.user = user;
            next();
        } catch (error) {
            // SECURITY: Generic error for any token verification failure
            // Don't reveal whether token was expired, invalid, or malformed
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

// ============================================================
// Role-Based Access Control Middleware
// ============================================================

/**
 * SECURITY: Restricts access to admin-only endpoints
 * Must be used after the 'protect' middleware
 */
export const adminOnly = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // SECURITY: Ensure user is authenticated first
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Not authenticated',
        });
        return;
    }

    // SECURITY: Check for admin role
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Admin access required',
        });
        return;
    }

    next();
};

