import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PostType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Rocket, Trophy, Briefcase, Loader2, ArrowLeft, Plus, X } from 'lucide-react';

const postTypes: { value: PostType; label: string; icon: React.ElementType; description: string }[] = [
  { 
    value: 'project', 
    label: 'Project', 
    icon: Rocket,
    description: 'Share a project you\'re working on'
  },
  { 
    value: 'hackathon', 
    label: 'Hackathon', 
    icon: Trophy,
    description: 'Post about an upcoming hackathon'
  },
  { 
    value: 'internship', 
    label: 'Internship', 
    icon: Briefcase,
    description: 'Share an internship opportunity'
  },
];

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [type, setType] = useState<PostType>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Post created successfully!', {
      description: 'Your post is now visible in the feed.',
    });
    
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="gradient-card border-border/50 shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-2xl">Create New Post</CardTitle>
                <CardDescription>
                  Share something with the MiniHub community
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Post Type Selection */}
                <div className="space-y-3">
                  <Label>Post Type</Label>
                  <RadioGroup 
                    value={type} 
                    onValueChange={(val) => setType(val as PostType)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {postTypes.map(postType => {
                      const Icon = postType.icon;
                      const isSelected = type === postType.value;
                      
                      return (
                        <Label 
                          key={postType.value}
                          htmlFor={postType.value} 
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-glow' 
                              : 'border-border hover:border-muted-foreground/50'
                          }`}
                        >
                          <RadioGroupItem value={postType.value} id={postType.value} className="sr-only" />
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {postType.label}
                          </span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Give your post a catchy title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {title.length}/100
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your post in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/1000
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      maxLength={20}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAddTag}
                      disabled={tags.length >= 5}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map(tag => (
                        <span 
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                        >
                          #{tag}
                          <button 
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {5 - tags.length} tags remaining
                  </p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                    disabled={isSubmitting || !title || !description}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Publish Post
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
