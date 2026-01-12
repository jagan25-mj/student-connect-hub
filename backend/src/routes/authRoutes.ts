import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../middlewares/validation';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, resetPassword);
router.get('/verify-email/:token', verifyEmail);

export default router;

