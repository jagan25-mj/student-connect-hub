import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Post } from '@/types';
import { postsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditPostDialog } from '@/components/EditPostDialog';
import { toast } from 'sonner';
import { Heart, MessageCircle, Rocket, Trophy, Briefcase, Send, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post & { likedBy?: string[] };
  index?: number;
  onUpdate?: (postId: string, updates: Partial<Post>) => void;
  onDelete?: (postId: string) => void;
}

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

export function PostCard({ post, index = 0, onUpdate, onDelete }: PostCardProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const config = typeConfig[post.type];
  const Icon = config.icon;

  // Check if current user liked the post
  const [isLiked, setIsLiked] = useState(() => {
    if (user && post.likedBy) {
      return post.likedBy.some((id: string) => id === user.id);
    }
    return false;
  });
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments);

  // Edit/Delete state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user can edit/delete
  const isOwner = user && post.author?.id === user.id;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  // Safely get author info
  const authorName = post.author?.name || 'Unknown';
  const authorAvatar = post.author?.avatar || '';

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like posts');
      return;
    }

    setIsLiking(true);
    try {
      const response = await postsApi.like(post.id);
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likes);
        if (onUpdate) {
          onUpdate(post.id, { likes: response.data.likes });
        }
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
      const response = await postsApi.addComment(post.id, commentText.trim());
      if (response.success) {
        setCommentsCount(prev => prev + 1);
        setCommentText('');
        setShowCommentInput(false);
        toast.success('Comment added!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to comment');
      return;
    }
    setShowCommentInput(!showCommentInput);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await postsApi.delete(post.id);
      if (response.success) {
        toast.success('Post deleted successfully!');
        if (onDelete) {
          onDelete(post.id);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    if (onUpdate) {
      onUpdate(post.id, updatedPost);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
      >
        <Card className="group gradient-card border border-border/50 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-background">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {authorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${config.className} font-medium`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
                {canModify && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Post options">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3 flex-1">
            <Link to={`/post/${post.id}`}>
              <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer hover:underline">
                {post.title}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {post.description}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs rounded-full bg-secondary/80 text-secondary-foreground font-medium hover:bg-secondary transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-3 border-t border-border/50 mt-auto flex-col gap-3">
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 transition-all ${isLiked
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                aria-label={`${likesCount} likes`}
                title={isLiked ? "Unlike this post" : "Like this post"}
                onClick={handleLike}
                disabled={isLiking}
              >
                {isLiking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                )}
                <span className="text-sm font-medium">{likesCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                aria-label={`${commentsCount} comments`}
                title="Add a comment"
                onClick={handleCommentClick}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{commentsCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground hover:text-primary"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                View details
              </Button>
            </div>

            {/* Comment Input */}
            {showCommentInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 w-full"
              >
                <Input
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                  disabled={isCommenting}
                  className="flex-1 h-9"
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={isCommenting || !commentText.trim()}
                  className="h-9"
                  aria-label="Submit comment"
                >
                  {isCommenting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <EditPostDialog
        post={post}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={handlePostUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

