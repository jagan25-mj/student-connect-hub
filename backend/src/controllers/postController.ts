import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post';

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
export const getPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { type } = req.query;

        // Build query
        const query: Record<string, string> = {};
        if (type && type !== 'all') {
            query.type = type as string;
        }

        const posts = await Post.find(query).sort({ createdAt: -1 });

        // Transform posts to match frontend format
        const formattedPosts = posts.map((post) => ({
            id: post._id,
            type: post.type,
            title: post.title,
            description: post.description,
            tags: post.tags,
            author: post.author,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
        }));

        res.status(200).json({
            success: true,
            count: formattedPosts.length,
            data: formattedPosts,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
export const getPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                id: post._id,
                type: post.type,
                title: post.title,
                description: post.description,
                tags: post.tags,
                author: post.author,
                likes: post.likes,
                comments: post.comments,
                createdAt: post.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a post
// @route   POST /api/v1/posts
// @access  Private
export const createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { type, title, description, tags } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const post = await Post.create({
            type,
            title,
            description,
            tags: tags || [],
            author: req.user._id,
        });

        // Populate author for response
        await post.populate('author', 'name email role avatar createdAt');

        res.status(201).json({
            success: true,
            data: {
                id: post._id,
                type: post.type,
                title: post.title,
                description: post.description,
                tags: post.tags,
                author: post.author,
                likes: post.likes,
                comments: post.comments,
                createdAt: post.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a post
// @route   DELETE /api/v1/posts/:id
// @access  Private (Admin only)
export const deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found',
            });
            return;
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Post deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
