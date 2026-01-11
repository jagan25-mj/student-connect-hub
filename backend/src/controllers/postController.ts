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

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .populate('comments.user', 'name avatar');

        // Transform posts to match frontend format
        const formattedPosts = posts.map((post) => ({
            id: post._id,
            type: post.type,
            title: post.title,
            description: post.description,
            tags: post.tags,
            author: post.author,
            likes: post.likes,
            likedBy: post.likedBy,
            comments: post.comments.length,
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
        const post = await Post.findById(req.params.id)
            .populate('comments.user', 'name avatar');

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
                likedBy: post.likedBy,
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
                likedBy: post.likedBy,
                comments: 0,
                createdAt: post.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Like/Unlike a post
// @route   POST /api/v1/posts/:id/like
// @access  Private
export const likePost = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found',
            });
            return;
        }

        const userId = req.user._id;
        const likedIndex = post.likedBy.findIndex(
            (id) => id.toString() === userId.toString()
        );

        let liked: boolean;

        if (likedIndex > -1) {
            // User already liked - unlike
            post.likedBy.splice(likedIndex, 1);
            post.likes = Math.max(0, post.likes - 1);
            liked = false;
        } else {
            // Like the post
            post.likedBy.push(userId);
            post.likes += 1;
            liked = true;
        }

        await post.save();

        res.status(200).json({
            success: true,
            data: {
                likes: post.likes,
                liked,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a comment
// @route   POST /api/v1/posts/:id/comments
// @access  Private
export const addComment = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'Comment text is required',
            });
            return;
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found',
            });
            return;
        }

        post.comments.push({
            user: req.user._id,
            text: text.trim(),
        } as any);

        await post.save();
        await post.populate('comments.user', 'name avatar');

        const newComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            data: newComment,
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
