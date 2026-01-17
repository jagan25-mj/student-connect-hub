import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, User, FileText, AlertCircle, Check } from 'lucide-react';

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NAME_MIN = 2;
const NAME_MAX = 50;
const BIO_MAX = 200;

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
    const { user, updateUser, refreshUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Validation states
    const nameLength = name.trim().length;
    const bioLength = bio.length;
    const isNameValid = nameLength >= NAME_MIN && nameLength <= NAME_MAX;
    const isBioValid = bioLength <= BIO_MAX;
    const isFormValid = isNameValid && isBioValid;

    // Reset form when dialog opens
    useEffect(() => {
        if (open && user) {
            setName(user.name);
            setBio(user.bio || '');
            setError('');
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate name
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (nameLength < NAME_MIN) {
            setError(`Name must be at least ${NAME_MIN} characters`);
            return;
        }

        if (nameLength > NAME_MAX) {
            setError(`Name cannot exceed ${NAME_MAX} characters`);
            return;
        }

        if (bioLength > BIO_MAX) {
            setError(`Bio cannot exceed ${BIO_MAX} characters`);
            return;
        }

        setIsLoading(true);
        try {
            const response = await usersApi.updateProfile({
                name: name.trim(),
                bio: bio.trim(),
            });

            if (response.success) {
                // Update user in context
                updateUser(response.user);
                // Also refresh to ensure we have latest data
                await refreshUser();
                toast.success('Profile updated successfully!', {
                    icon: <Check className="h-4 w-4" />,
                });
                onOpenChange(false);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getCharacterCountColor = (current: number, max: number, min: number = 0) => {
        if (current < min) return 'text-destructive';
        if (current > max) return 'text-destructive';
        if (current > max * 0.9) return 'text-yellow-500';
        return 'text-muted-foreground';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        Edit Profile
                    </DialogTitle>
                    <DialogDescription>
                        Update your profile information. Your name will be visible to other students.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Name Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Display Name
                            </Label>
                            <span className={`text-xs ${getCharacterCountColor(nameLength, NAME_MAX, NAME_MIN)}`}>
                                {nameLength}/{NAME_MAX}
                            </span>
                        </div>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your display name"
                            maxLength={NAME_MAX + 10} // Allow typing beyond to show error
                            disabled={isLoading}
                            className={!isNameValid && nameLength > 0 ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            {NAME_MIN}-{NAME_MAX} characters. This is how other students will see you.
                        </p>
                    </div>

                    {/* Bio Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Bio
                                <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <span className={`text-xs ${getCharacterCountColor(bioLength, BIO_MAX)}`}>
                                {bioLength}/{BIO_MAX}
                            </span>
                        </div>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell other students about yourself, your interests, skills, or what you're looking for..."
                            maxLength={BIO_MAX + 10} // Allow typing beyond to show error
                            rows={4}
                            disabled={isLoading}
                            className={`resize-none ${!isBioValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        />
                        <p className="text-xs text-muted-foreground">
                            Share your interests, skills, or what projects you're working on.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

