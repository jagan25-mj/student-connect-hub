import express from 'express';
import {
    getPosts,
    getPost,
    createPost,
    deletePost,
} from '../controllers/postController';
import { protect, adminOnly } from '../middlewares/auth';
import { createPostValidation } from '../middlewares/validation';

const router = express.Router();

router.route('/')
    .get(getPosts)
    .post(protect, createPostValidation, createPost);

router.route('/:id')
    .get(getPost)
    .delete(protect, adminOnly, deletePost);

export default router;
