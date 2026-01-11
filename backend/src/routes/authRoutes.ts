import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { registerValidation, loginValidation } from '../middlewares/validation';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

export default router;
