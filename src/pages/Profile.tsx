import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Mail,
    Calendar,
    Shield,
    LogOut,
    Settings,
    Edit,
    Construction
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleEditProfile = () => {
        toast.info('Edit Profile', {
            description: 'Profile editing feature coming soon!',
            icon: <Construction className="h-4 w-4" />,
        });
    };

    const handleAccountSettings = () => {
        toast.info('Account Settings', {
            description: 'Account settings feature coming soon!',
            icon: <Construction className="h-4 w-4" />,
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Not logged in</h2>
                    <p className="text-muted-foreground mb-4">Please log in to view your profile</p>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </div>
        );
    }

    const roleColors = {
        student: 'bg-primary/10 text-primary border-primary/20',
        founder: 'bg-warning/10 text-warning border-warning/20',
        admin: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Profile Header Card */}
                    <Card className="gradient-card border-border/50 overflow-hidden">
                        {/* Banner */}
                        <div className="h-24 gradient-primary" />

                        <CardHeader className="relative pb-0">
                            {/* Avatar */}
                            <div className="absolute -top-12 left-6">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Edit Button */}
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    aria-label="Edit profile"
                                    onClick={handleEditProfile}
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {/* Name and Role */}
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className={roleColors[user.role]}>
                                            <Shield className="h-3 w-3 mr-1" />
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {/* User Info */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card className="gradient-card border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Account</CardTitle>
                            <CardDescription>Manage your account settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3"
                                aria-label="Account settings"
                                onClick={handleAccountSettings}
                            >
                                <Settings className="h-4 w-4" />
                                Account Settings
                            </Button>

                            {user.role === 'admin' && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-3"
                                    onClick={() => navigate('/admin')}
                                    aria-label="Go to admin dashboard"
                                >
                                    <Shield className="h-4 w-4" />
                                    Admin Dashboard
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                className="w-full justify-start gap-3"
                                onClick={handleLogout}
                                aria-label="Log out of your account"
                            >
                                <LogOut className="h-4 w-4" />
                                Log Out
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
