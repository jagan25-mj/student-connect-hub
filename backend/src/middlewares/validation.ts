/**
 * Input Validation Middleware
 * 
 * SECURITY OVERVIEW:
 * - Schema-based validation using express-validator
 * - Strict type checking and length limits
 * - Rejection of unexpected/extra fields
 * - Input sanitization to prevent XSS and injection attacks
 * - ObjectId format validation for MongoDB
 * 
 * OWASP Alignment:
 * - A03:2021 Injection Prevention
 * - A07:2021 Input Validation
 */

import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// ============================================================
// Validation Error Handler
// ============================================================

/**
 * SECURITY: Centralized validation error handler
 * Returns consistent error format without exposing internal details
 */
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // SECURITY: Only return field names and messages, not internal details
        const errorMessages = errors.array().map(err => err.msg);
        res.status(400).json({
            success: false,
            error: errorMessages.join(', '),
        });
        return;
    }
    next();
};

// ============================================================
// Unknown Field Rejection Middleware
// ============================================================

/**
 * SECURITY: Middleware factory to reject requests with unexpected fields
 * This prevents mass assignment attacks and unexpected data injection
 * 
 * @param allowedFields - Array of field names that are allowed in the request body
 */
export const rejectUnknownFields = (allowedFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (req.body && typeof req.body === 'object') {
            const receivedFields = Object.keys(req.body);
            const unknownFields = receivedFields.filter(field => !allowedFields.includes(field));

            if (unknownFields.length > 0) {
                // SECURITY: Log unknown field attempts for monitoring
                // but don't expose field names in response
                res.status(400).json({
                    success: false,
                    error: 'Request contains unexpected fields',
                });
                return;
            }
        }
        next();
    };
};

// ============================================================
// ObjectId Parameter Validation
// ============================================================

/**
 * SECURITY: Validates that a URL parameter is a valid MongoDB ObjectId
 * Prevents NoSQL injection through malformed IDs
 */
export const validateObjectId = (paramName: string): ValidationChain[] => {
    return [
        param(paramName)
            .custom((value) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('Invalid resource ID format');
                }
                return true;
            }),
    ];
};

/**
 * SECURITY: Middleware to validate :id parameter in routes
 */
export const validateIdParam = [
    ...validateObjectId('id'),
    handleValidationErrors,
];

// ============================================================
// Text Sanitization Helpers
// ============================================================

/**
 * SECURITY: Escapes HTML entities to prevent XSS attacks
 * Used for any user-generated content that will be displayed
 */
const sanitizeHtml = (value: string): string => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

// ============================================================
// Auth Validation Rules
// ============================================================

/**
 * SECURITY: Registration validation with:
 * - Name: Required, trimmed, max 50 chars, HTML sanitized
 * - Email: Required, valid format, normalized
 * - Password: Required, min 6 chars (consider adding complexity requirements)
 * - Role: Optional, must be from allowed list
 */
export const registerValidation = [
    // SECURITY: Reject unexpected fields to prevent mass assignment
    rejectUnknownFields(['name', 'email', 'password', 'role']),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters')
        .customSanitizer(sanitizeHtml),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail()
        .isLength({ max: 254 }) // RFC 5321 max email length
        .withMessage('Email is too long'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters'),
    // SECURITY: Consider adding password complexity requirements:
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    // .withMessage('Password must contain uppercase, lowercase, and number'),
    body('role')
        .optional()
        .isIn(['student', 'founder'])
        // SECURITY: 'admin' role cannot be self-assigned during registration
        .withMessage('Role must be student or founder'),
    handleValidationErrors,
];

/**
 * SECURITY: Login validation
 * Note: Generic error messages prevent username enumeration
 */
export const loginValidation = [
    rejectUnknownFields(['email', 'password']),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors,
];

// ============================================================
// Post Validation Rules
// ============================================================

/**
 * SECURITY: Post creation validation with:
 * - Strict type enumeration
 * - HTML sanitization for title/description
 * - Tag array limits and per-tag length limits
 */
export const createPostValidation = [
    rejectUnknownFields(['type', 'title', 'description', 'tags']),
    body('type')
        .notEmpty()
        .withMessage('Post type is required')
        .isIn(['project', 'hackathon', 'internship'])
        .withMessage('Type must be project, hackathon, or internship'),
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters')
        .customSanitizer(sanitizeHtml),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .customSanitizer(sanitizeHtml),
    body('tags')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Maximum 5 tags allowed'),
    // SECURITY: Validate each tag individually
    body('tags.*')
        .optional()
        .isString()
        .withMessage('Each tag must be a string')
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be 1-30 characters')
        .customSanitizer(sanitizeHtml),
    handleValidationErrors,
];

/**
 * SECURITY: Post update validation (all fields optional)
 */
export const updatePostValidation = [
    rejectUnknownFields(['type', 'title', 'description', 'tags']),
    body('type')
        .optional()
        .isIn(['project', 'hackathon', 'internship'])
        .withMessage('Type must be project, hackathon, or internship'),
    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters')
        .customSanitizer(sanitizeHtml),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .customSanitizer(sanitizeHtml),
    body('tags')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Maximum 5 tags allowed'),
    body('tags.*')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be 1-30 characters')
        .customSanitizer(sanitizeHtml),
    handleValidationErrors,
];

// ============================================================
// Comment Validation Rules
// ============================================================

/**
 * SECURITY: Comment validation with XSS prevention
 */
export const commentValidation = [
    rejectUnknownFields(['text']),
    body('text')
        .trim()
        .notEmpty()
        .withMessage('Comment text is required')
        .isLength({ min: 1, max: 500 })
        .withMessage('Comment must be between 1 and 500 characters')
        .customSanitizer(sanitizeHtml),
    handleValidationErrors,
];

// ============================================================
// Profile Validation Rules
// ============================================================

/**
 * SECURITY: Profile update validation with limited fields
 */
export const updateProfileValidation = [
    rejectUnknownFields(['name', 'bio']),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Name must be between 1 and 50 characters')
        .customSanitizer(sanitizeHtml),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Bio cannot exceed 200 characters')
        .customSanitizer(sanitizeHtml),
    handleValidationErrors,
];

// ============================================================
// Password Reset Validation Rules
// ============================================================

/**
 * SECURITY: Forgot password validation
 */
export const forgotPasswordValidation = [
    rejectUnknownFields(['email']),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email'),
    handleValidationErrors,
];

/**
 * SECURITY: Reset password validation with token parameter
 */
export const resetPasswordValidation = [
    rejectUnknownFields(['password']),
    param('token')
        .notEmpty()
        .withMessage('Reset token is required')
        .isLength({ min: 64, max: 64 })
        .withMessage('Invalid reset token format')
        .isHexadecimal()
        .withMessage('Invalid reset token'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters'),
    handleValidationErrors,
];

// ============================================================
// Search Query Validation
// ============================================================

/**
 * SECURITY: Search query validation to prevent NoSQL injection
 * Escapes special regex characters in search terms
 */
export const searchValidation = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search query too long')
        .customSanitizer((value: string) => {
            // SECURITY: Escape regex special characters to prevent ReDoS
            return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }),
    handleValidationErrors,
];

/**
 * SECURITY: Post type query validation
 */
export const postTypeQueryValidation = [
    query('type')
        .optional()
        .isIn(['all', 'project', 'hackathon', 'internship'])
        .withMessage('Invalid post type filter'),
    handleValidationErrors,
];


