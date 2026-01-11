import { motion } from 'framer-motion';
import { Post } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="group gradient-card border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={config.className}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
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
                  className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
