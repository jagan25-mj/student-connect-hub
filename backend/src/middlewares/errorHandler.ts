/**
 * Global Error Handler Middleware
 * 
 * SECURITY OVERVIEW:
 * - Sanitizes error messages in production to prevent information disclosure
 * - Handles known error types with appropriate status codes
 * - Logs full errors server-side for debugging
 * - Never exposes stack traces or internal details to clients in production
 * 
 * OWASP Alignment:
 * - A09:2021 Security Logging and Monitoring Failures
 * - Error messages should not reveal sensitive information
 */

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

    // ============================================================
    // SECURITY: Server-side logging (never exposed to client)
    // ============================================================
    // Log detailed error information for debugging and monitoring
    // In production, consider sending to a logging service
    if (!isProduction) {
        console.error('Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // SECURITY: In production, log minimal info to avoid log injection
        // and reduce log storage of potentially sensitive data
        console.error('Error:', err.name, err.message);
    }

    // ============================================================
    // SECURITY: Error Type Classification
    // ============================================================
    // Convert known error types to appropriate HTTP responses
    // Avoid exposing internal database/framework error details

    // Mongoose bad ObjectId (invalid resource ID format)
    if (err.name === 'CastError') {
        // SECURITY: Generic message hides database implementation details
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key error (unique constraint violation)
    if (err.code === 11000) {
        // SECURITY: Reveal which field was duplicated but not the value
        const field = Object.keys(err.keyValue || {})[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose validation error (schema validation failed)
    if (err.name === 'ValidationError') {
        // SECURITY: Return validation messages but not internal schema details
        const messages = Object.values(err.errors || {}).map((e) => e.message);
        message = messages.join(', ');
        statusCode = 400;
    }

    // JWT errors (authentication failures)
    if (err.name === 'JsonWebTokenError') {
        // SECURITY: Generic message prevents token format disclosure
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        // SECURITY: Indicate expiration but not when or why
        message = 'Token expired';
        statusCode = 401;
    }

    // ============================================================
    // SECURITY: Production Error Sanitization
    // ============================================================
    // In production, sanitize 500 errors to prevent information disclosure
    // Internal errors may contain sensitive details (file paths, DB queries, etc.)
    if (isProduction && statusCode === 500) {
        message = 'Internal server error';
    }

    // ============================================================
    // Response
    // ============================================================
    res.status(statusCode).json({
        success: false,
        error: message,
        // SECURITY: Only include stack trace in development for debugging
        // Stack traces can reveal file structure, dependencies, and logic
        ...((!isProduction && statusCode === 500) && { stack: err.stack }),
    });
};

export default errorHandler;

