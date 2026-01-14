/**
 * Rate Limiter Middleware
 * 
 * SECURITY: Implements rate limiting to protect against:
 * - Brute force attacks on authentication endpoints
 * - Denial of Service (DoS) attacks
 * - API abuse and resource exhaustion
 * 
 * Features:
 * - IP-based limiting for unauthenticated requests
 * - User-based limiting for authenticated requests
 * - Endpoint-specific limits for sensitive operations
 * - Graceful 429 responses with Retry-After headers
 */

import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

// ============================================================
// Configuration from environment (with sensible defaults)
// ============================================================

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const MAX_GENERAL = parseInt(process.env.RATE_LIMIT_MAX_GENERAL || '100', 10);
const MAX_AUTH = parseInt(process.env.RATE_LIMIT_MAX_AUTH || '20', 10);
const MAX_SENSITIVE = parseInt(process.env.RATE_LIMIT_MAX_SENSITIVE || '5', 10);

// ============================================================
// Custom key generator for user-based rate limiting
// ============================================================

/**
 * SECURITY: Generates a unique key for rate limiting based on:
 * - User ID (if authenticated) - prevents authenticated abuse
 * - IP address (fallback) - protects against unauthenticated abuse
 * 
 * This dual approach ensures:
 * 1. Authenticated users can't bypass limits by changing IPs
 * 2. Unauthenticated attackers are still rate limited by IP
 */
const keyGenerator = (req: Request): string => {
    // If user is authenticated, use their user ID
    // This prevents a single user from making excessive requests
    if (req.user && req.user._id) {
        return `user:${req.user._id.toString()}`;
    }

    // Fall back to IP address for unauthenticated requests
    // SECURITY: x-forwarded-for is used when behind a proxy (common in production)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || req.socket.remoteAddress || 'unknown';

    return `ip:${ip}`;
};

// ============================================================
// Standardized error response handler
// ============================================================

/**
 * SECURITY: Returns a consistent, informative error response for rate limit violations.
 * Includes Retry-After header to inform clients when they can retry.
 */
const createRateLimitHandler = (message: string) => {
    return (_req: Request, res: Response): void => {
        res.status(429).json({
            success: false,
            error: message,
            retryAfter: Math.ceil(WINDOW_MS / 1000), // seconds until reset
        });
    };
};

// ============================================================
// Base configuration shared by all limiters
// ============================================================

const baseConfig: Partial<Options> = {
    windowMs: WINDOW_MS,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,  // Disable deprecated `X-RateLimit-*` headers
    // SECURITY: Skip rate limiting for successful requests in development
    // In production, all requests count toward the limit
    skipSuccessfulRequests: false,
};

// ============================================================
// Rate Limiter Instances
// ============================================================

/**
 * General API rate limiter
 * Applied to all API endpoints as a baseline protection
 * 
 * Default: 100 requests per 15 minutes per user/IP
 */
export const generalLimiter = rateLimit({
    ...baseConfig,
    max: MAX_GENERAL,
    keyGenerator,
    handler: createRateLimitHandler(
        'Too many requests. Please try again later.'
    ),
});

/**
 * Authentication rate limiter
 * Applied to login, register, and password-related endpoints
 * 
 * SECURITY: Stricter limits prevent brute force attacks on credentials
 * Default: 20 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    ...baseConfig,
    max: MAX_AUTH,
    // SECURITY: Always use IP for auth endpoints since user isn't authenticated yet
    keyGenerator: (req: Request): string => {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : req.ip || req.socket.remoteAddress || 'unknown';
        return `auth:${ip}`;
    },
    handler: createRateLimitHandler(
        'Too many authentication attempts. Please try again in 15 minutes.'
    ),
});

/**
 * Sensitive operations rate limiter
 * Applied to password reset, email verification, etc.
 * 
 * SECURITY: Very strict limits for operations that:
 * - Send emails (abuse prevention)
 * - Modify credentials (account takeover prevention)
 * 
 * Default: 5 requests per 15 minutes per IP
 */
export const sensitiveLimiter = rateLimit({
    ...baseConfig,
    max: MAX_SENSITIVE,
    keyGenerator: (req: Request): string => {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : req.ip || req.socket.remoteAddress || 'unknown';
        return `sensitive:${ip}`;
    },
    handler: createRateLimitHandler(
        'Too many requests for this operation. Please try again in 15 minutes.'
    ),
});

/**
 * Create action rate limiter
 * Applied to content creation endpoints (posts, comments)
 * 
 * SECURITY: Prevents spam and abuse of creation endpoints
 * Default: 30 requests per 15 minutes per user
 */
export const createLimiter = rateLimit({
    ...baseConfig,
    max: 30,
    keyGenerator,
    handler: createRateLimitHandler(
        'Too many items created. Please slow down and try again later.'
    ),
});
