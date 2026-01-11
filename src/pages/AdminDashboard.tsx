import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockPosts, mockUsers } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
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
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

const stats = [
  { label: 'Total Users', value: mockUsers.length, icon: Users, color: 'text-primary' },
  { label: 'Total Posts', value: mockPosts.length, icon: FileText, color: 'text-success' },
  { label: 'Active Today', value: 12, icon: TrendingUp, color: 'text-warning' },
  { label: 'Pending Review', value: 3, icon: Shield, color: 'text-destructive' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(mockPosts);
  const [users, setUsers] = useState(mockUsers);

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast.success('Post deleted successfully');
  };

  const handleToggleUserStatus = (userId: string) => {
    toast.success('User status updated');
  };

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
              Manage users, posts, and platform settings
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

          {/* Management Tabs */}
          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="posts" className="gap-2">
                <FileText className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <Card className="gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>All Posts</CardTitle>
                  <CardDescription>
                    Manage and moderate community posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Engagement</TableHead>
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
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {post.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{post.author.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {post.likes} likes, {post.comments} comments
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(u => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={u.role === 'admin' ? 'default' : 'outline'}
                              className={u.role === 'admin' ? 'gradient-primary text-primary-foreground' : 'capitalize'}
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDistanceToNow(u.createdAt, { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-sm text-success">Active</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleToggleUserStatus(u.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
