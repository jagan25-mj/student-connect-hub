import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { postsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  Shield,
  TrendingUp,
  Eye,
  Trash2,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsApi.getAll();
        if (response.success) {
          setPosts(response.data || []);
        }
      } catch (error) {
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId: string) => {
    setIsDeleting(postId);
    try {
      const response = await postsApi.delete(postId);
      if (response.success) {
        setPosts(posts.filter(p => p.id !== postId));
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(null);
    }
  };

  const stats = [
    { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-success' },
    { label: 'Projects', value: posts.filter(p => p.type === 'project').length, icon: TrendingUp, color: 'text-primary' },
    { label: 'Hackathons', value: posts.filter(p => p.type === 'hackathon').length, icon: Users, color: 'text-warning' },
    { label: 'Internships', value: posts.filter(p => p.type === 'internship').length, icon: Shield, color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg gradient-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Manage posts and platform content
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="gradient-card border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Posts Management */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Manage and moderate community posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No posts found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map(post => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {post.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author?.avatar} />
                              <AvatarFallback className="text-xs">
                                {post.author?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{post.author?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isDeleting === post.id}>
                                {isDeleting === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeletePost(post.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
