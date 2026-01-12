import express from 'express';
import { updateMe, searchUsers } from '../controllers/userController';
import { protect } from '../middlewares/auth';
import { updateProfileValidation } from '../middlewares/validation';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Update current user profile
router.put('/me', updateProfileValidation, updateMe);

// Search users
router.get('/', searchUsers);

export default router;
