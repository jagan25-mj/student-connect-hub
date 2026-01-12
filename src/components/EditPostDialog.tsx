import { useState } from 'react';
import { postsApi } from '@/lib/api';
import { Post, PostType } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditPostDialogProps {
    post: Post;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (updatedPost: Post) => void;
}

export function EditPostDialog({ post, open, onOpenChange, onUpdate }: EditPostDialogProps) {
    const [type, setType] = useState<PostType>(post.type);
    const [title, setTitle] = useState(post.title);
    const [description, setDescription] = useState(post.description);
    const [tagsInput, setTagsInput] = useState(post.tags?.join(', ') || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }

        setIsLoading(true);
        try {
            const tags = tagsInput
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
                .slice(0, 5);

            const response = await postsApi.update(post.id, {
                type,
                title: title.trim(),
                description: description.trim(),
                tags,
            });

            if (response.success) {
                onUpdate(response.data);
                toast.success('Post updated successfully!');
                onOpenChange(false);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update post');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setType(post.type);
            setTitle(post.title);
            setDescription(post.description);
            setTagsInput(post.tags?.join(', ') || '');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription>
                        Update your post details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={type} onValueChange={(v) => setType(v as PostType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="project">Project</SelectItem>
                                    <SelectItem value="hackathon">Hackathon</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post title"
                                maxLength={100}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your post..."
                                maxLength={1000}
                                rows={4}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                {description.length}/1000 characters
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                                id="tags"
                                value={tagsInput}
                                onChange={(e) => setTagsInput(e.target.value)}
                                placeholder="react, typescript, hackathon"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum 5 tags
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
