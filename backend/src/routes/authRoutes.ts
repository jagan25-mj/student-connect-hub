/**
 * Authentication Routes
 * 
 * SECURITY:
 * - Stricter rate limiting on login/register (brute force prevention)
 * - Very strict rate limiting on password reset (abuse prevention)
 * - Input validation on all endpoints
 * - Token parameter validation
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

const router = express.Router();

// ============================================================
// Public Routes
// ============================================================

// POST /auth/register - Create new user account
// SECURITY: Rate limited at server level + input validation
router.post('/register', registerValidation, register);

// POST /auth/login - Authenticate user
// SECURITY: Rate limited at server level + generic error messages
router.post('/login', loginValidation, login);

// POST /auth/forgot-password - Request password reset
// SECURITY: Very strict rate limit + no user enumeration
router.post('/forgot-password', sensitiveLimiter, forgotPasswordValidation, forgotPassword);

// POST /auth/reset-password/:token - Reset password with token
// SECURITY: Very strict rate limit + token validation + password validation
router.post('/reset-password/:token', sensitiveLimiter, resetPasswordValidation, resetPassword);

// GET /auth/verify-email/:token - Verify email address
// SECURITY: Token validated by controller
router.get('/verify-email/:token', verifyEmail);

// ============================================================
// Protected Routes
// ============================================================

// GET /auth/me - Get current authenticated user
// SECURITY: Requires valid JWT token
router.get('/me', protect, getMe);

export default router;


