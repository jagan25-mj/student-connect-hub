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
import { createPostValidation, updatePostValidation } from '../middlewares/validation';

const router = express.Router();

router.route('/')
    .get(getPosts)
    .post(protect, createPostValidation, createPost);

router.route('/:id')
    .get(getPost)
    .put(protect, updatePostValidation, updatePost)
    .delete(protect, deletePost);

// Like/Unlike a post
router.post('/:id/like', protect, likePost);

// Add a comment
router.post('/:id/comments', protect, addComment);

export default router;

