/**
 * Authentication Routes
 * 
 * SECURITY:
 * - Stricter rate limiting on login/register (brute force prevention)
 * - Very strict rate limiting on password reset (abuse prevention)
 * - Input validation on all endpoints
 * - Token parameter validation
 * - Database connection check to prevent request timeouts
 */

import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController';
import { protect } from '../middlewares/auth';
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} from '../middlewares/validation';
import { sensitiveLimiter } from '../middlewares/rateLimiter';
import { requireDBConnection } from '../middlewares/dbCheck';

const router = express.Router();

// ============================================================
// Public Routes
// ============================================================

// POST /auth/register - Create new user account
// SECURITY: Rate limited at server level + input validation + DB check
router.post('/register', requireDBConnection, registerValidation, register);

// POST /auth/login - Authenticate user
// SECURITY: Rate limited at server level + generic error messages + DB check
router.post('/login', requireDBConnection, loginValidation, login);

// POST /auth/forgot-password - Request password reset
// SECURITY: Very strict rate limit + no user enumeration + DB check
router.post('/forgot-password', requireDBConnection, sensitiveLimiter, forgotPasswordValidation, forgotPassword);

// POST /auth/reset-password/:token - Reset password with token
// SECURITY: Very strict rate limit + token validation + password validation + DB check
router.post('/reset-password/:token', requireDBConnection, sensitiveLimiter, resetPasswordValidation, resetPassword);

// GET /auth/verify-email/:token - Verify email address
// SECURITY: Token validated by controller + DB check
router.get('/verify-email/:token', requireDBConnection, verifyEmail);

// ============================================================
// Protected Routes
// ============================================================

// GET /auth/me - Get current authenticated user
// SECURITY: Requires valid JWT token + DB check
router.get('/me', requireDBConnection, protect, getMe);

export default router;


