/**
 * Database Connection Check Middleware
 * 
 * Returns early with a clear error if MongoDB is not connected,
 * preventing requests from hanging indefinitely.
 */

import { Request, Response, NextFunction } from 'express';
import { isDBConnected, getDBState } from '../config/db';

export const requireDBConnection = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!isDBConnected()) {
        const state = getDBState();
        console.error(`❌ Database request failed - MongoDB is ${state}`);

        res.status(503).json({
            success: false,
            error: 'Database temporarily unavailable. Please try again in a moment.',
            details: process.env.NODE_ENV === 'production'
                ? undefined
                : `MongoDB connection state: ${state}`,
        });
        return;
    }
    next();
};
