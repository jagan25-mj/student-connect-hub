/**
 * User Routes
 * 
 * SECURITY:
 * - All routes require authentication
 * - Input validation and sanitization
 * - Search query sanitization to prevent NoSQL injection
 */

import express from 'express';
import { updateMe, searchUsers } from '../controllers/userController';
import { protect } from '../middlewares/auth';
import { updateProfileValidation, searchValidation } from '../middlewares/validation';

const router = express.Router();

// ============================================================
// All routes require authentication
// ============================================================
router.use(protect);

// PUT /users/me - Update current user's profile
// SECURITY: Authenticated + validated input + limited fields
router.put('/me', updateProfileValidation, updateMe);

// GET /users - Search users
// SECURITY: Authenticated + search query sanitized to prevent ReDoS/injection
router.get('/', searchValidation, searchUsers);

export default router;

