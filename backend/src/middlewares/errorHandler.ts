import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, string>;
    errors?: Record<string, { message: string }>;
}

const isProduction = process.env.NODE_ENV === 'production';

const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Log error for debugging (but never log secrets)
    if (!isProduction) {
        console.error('Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // In production, log minimal info
        console.error('Error:', err.name, err.message);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors || {}).map((e) => e.message);
        message = messages.join(', ');
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    // In production, sanitize 500 errors
    if (isProduction && statusCode === 500) {
        message = 'Internal server error';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        // Only include stack trace in development
        ...((!isProduction && statusCode === 500) && { stack: err.stack }),
    });
};

export default errorHandler;
