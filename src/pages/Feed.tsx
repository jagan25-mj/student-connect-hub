import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { postsApi } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { Post, PostType } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Rocket, Trophy, Briefcase, LayoutGrid, Loader2 } from 'lucide-react';

type FilterType = 'all' | PostType;

const filters: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: LayoutGrid },
  { value: 'project', label: 'Projects', icon: Rocket },
  { value: 'hackathon', label: 'Hackathons', icon: Trophy },
  { value: 'internship', label: 'Internships', icon: Briefcase },
];

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await postsApi.getAll(activeFilter);
        if (response.success) {
          setPosts(response.data || []);
        } else {
          setError('Failed to load posts');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [activeFilter]);

  // Filter posts by search query (client-side)
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Feed</h1>
          <p className="text-muted-foreground">
            Discover projects, hackathons, and internship opportunities
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterType)}>
            <TabsList className="h-10">
              {filters.map(filter => (
                <TabsTrigger
                  key={filter.value}
                  value={filter.value}
                  className="gap-2"
                >
                  <filter.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{filter.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Error loading posts</h3>
            <p className="text-muted-foreground">{error}</p>
          </motion.div>
        )}

        {/* Posts Grid */}
        {!isLoading && !error && filteredPosts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Be the first to create a post!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
