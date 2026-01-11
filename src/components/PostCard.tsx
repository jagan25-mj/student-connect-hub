import { motion } from 'framer-motion';
import { Post } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Rocket, Trophy, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  index?: number;
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

export function PostCard({ post, index = 0 }: PostCardProps) {
  const config = typeConfig[post.type];
  const Icon = config.icon;

  // Safely get author info
  const authorName = post.author?.name || 'Unknown';
  const authorAvatar = post.author?.avatar || '';

  return (
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
            <Badge variant="outline" className={`${config.className} font-medium`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
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

        <CardFooter className="pt-3 border-t border-border/50 mt-auto">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
              aria-label={`${post.likes} likes`}
              title="Like this post"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
              aria-label={`${post.comments} comments`}
              title="View comments"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.comments}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
