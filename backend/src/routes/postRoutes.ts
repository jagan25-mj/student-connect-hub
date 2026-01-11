import express from 'express';
import {
    getPosts,
    getPost,
    createPost,
    deletePost,
    likePost,
    addComment,
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

// Like/Unlike a post
router.post('/:id/like', protect, likePost);

// Add a comment
router.post('/:id/comments', protect, addComment);

export default router;
