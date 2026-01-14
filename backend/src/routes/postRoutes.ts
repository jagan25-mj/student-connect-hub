/**
 * Post Routes
 * 
 * SECURITY:
 * - ObjectId validation on all :id parameters
 * - Input validation and sanitization on all mutation endpoints
 * - Authentication required for create/update/delete
 * - Rate limiting applied at server level + endpoint-specific limits
 */

import express from 'express';
import {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
} from '../controllers/postController';
import { protect } from '../middlewares/auth';
import {
    createPostValidation,
    updatePostValidation,
    commentValidation,
    validateIdParam,
    postTypeQueryValidation,
} from '../middlewares/validation';
import { createLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// ============================================================
// Public Routes
// ============================================================

// GET /posts - List all posts with optional type filter
// SECURITY: Query parameter validated against allowed values
router.get('/', postTypeQueryValidation, getPosts);

// GET /posts/:id - Get single post by ID
// SECURITY: ObjectId format validated to prevent NoSQL injection
router.get('/:id', validateIdParam, getPost);

// ============================================================
// Protected Routes (require authentication)
// ============================================================

// POST /posts - Create new post
// SECURITY: Authenticated + validated input + rate limited
router.post('/', protect, createLimiter, createPostValidation, createPost);

// PUT /posts/:id - Update post
// SECURITY: Authenticated + owner/admin check + validated input
router.put('/:id', protect, validateIdParam, updatePostValidation, updatePost);

// DELETE /posts/:id - Delete post
// SECURITY: Authenticated + owner/admin check
router.delete('/:id', protect, validateIdParam, deletePost);

// POST /posts/:id/like - Like/unlike a post
// SECURITY: Authenticated + ObjectId validated
router.post('/:id/like', protect, validateIdParam, likePost);

// POST /posts/:id/comments - Add a comment
// SECURITY: Authenticated + ObjectId validated + comment text sanitized
router.post('/:id/comments', protect, validateIdParam, commentValidation, addComment);

export default router;


