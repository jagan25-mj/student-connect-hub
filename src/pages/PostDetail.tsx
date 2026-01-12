import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { postsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post, Comment } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Heart,
    MessageCircle,
    Rocket,
    Trophy,
    Briefcase,
    Send,
    Loader2,
    ArrowLeft,
    Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
    project: {
        icon: Rocket,
        label: 'Project',
        className: 'bg-primary/10 text-primary border-primary/20',
    },
    hackathon: {
        icon: Trophy,
        label: 'Hackathon',
        className: 'bg-warning/10 text-warning border-warning/20',
    },
    internship: {
        icon: Briefcase,
        label: 'Internship',
        className: 'bg-success/10 text-success border-success/20',
    },
};

export default function PostDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [post, setPost] = useState<(Post & { commentsList?: Comment[] }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Like state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isLiking, setIsLiking] = useState(false);

    // Comment state
    const [commentText, setCommentText] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);
            try {
                const response = await postsApi.getById(id);
                if (response.success && response.data) {
                    setPost(response.data);
                    setLikesCount(response.data.likes || 0);
                    setComments(response.data.commentsList || []);

                    // Check if current user liked
                    if (user && response.data.likedBy) {
                        setIsLiked(response.data.likedBy.includes(user.id));
                    }
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load post');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [id, user]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to like posts');
            return;
        }

        setIsLiking(true);
        try {
            const response = await postsApi.like(id!);
            if (response.success) {
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likes);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to like post');
        } finally {
            setIsLiking(false);
        }
    };

    const handleComment = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to comment');
            return;
        }

        if (!commentText.trim()) {
            return;
        }

        setIsCommenting(true);
        try {
            const response = await postsApi.addComment(id!, commentText.trim());
            if (response.success) {
                setComments(prev => [...prev, response.data]);
                setCommentText('');
                toast.success('Comment added!');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add comment');
        } finally {
            setIsCommenting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
                    <p className="text-muted-foreground mb-4">{error || 'The post you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
                </div>
            </div>
        );
    }

    const config = typeConfig[post.type];
    const Icon = config.icon;
    const authorName = post.author?.name || 'Unknown';
    const authorAvatar = post.author?.avatar || '';

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/feed')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Feed
                    </Button>
                </motion.div>

                {/* Post Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="gradient-card border-border/50">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                                        <AvatarImage src={authorAvatar} alt={authorName} />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                            {authorName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">{authorName}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`${config.className} font-medium`}>
                                    <Icon className="h-3 w-3 mr-1" />
                                    {config.label}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
                            <p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 text-xs rounded-full bg-secondary/80 text-secondary-foreground font-medium"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex-col gap-4">
                            {/* Actions */}
                            <div className="flex items-center gap-4 w-full">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`gap-1.5 transition-all ${isLiked
                                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                                        }`}
                                    onClick={handleLike}
                                    disabled={isLiking}
                                >
                                    {isLiking ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                    )}
                                    <span className="font-medium">{likesCount} likes</span>
                                </Button>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="font-medium">{comments.length} comments</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Comment Input */}
                            <div className="flex items-center gap-2 w-full">
                                <Input
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleComment();
                                        }
                                    }}
                                    disabled={isCommenting || !isAuthenticated}
                                />
                                <Button
                                    onClick={handleComment}
                                    disabled={isCommenting || !commentText.trim() || !isAuthenticated}
                                >
                                    {isCommenting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {!isAuthenticated && (
                                <p className="text-sm text-muted-foreground">
                                    <Link to="/login" className="text-primary hover:underline">Log in</Link> to comment
                                </p>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Comments Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 space-y-4"
                >
                    <h2 className="text-lg font-semibold">Comments ({comments.length})</h2>

                    {comments.length === 0 ? (
                        <Card className="gradient-card border-border/50">
                            <CardContent className="py-8 text-center">
                                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <Card key={comment._id} className="gradient-card border-border/50">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={comment.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name}`}
                                                    alt={comment.user?.name || 'User'}
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {(comment.user?.name || 'U').charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-sm">{comment.user?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground">{comment.text}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
