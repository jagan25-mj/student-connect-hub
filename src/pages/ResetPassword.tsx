import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            toast.error('Please enter a new password');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!token) {
            toast.error('Invalid reset token');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.resetPassword(token, password);
            if (response.success) {
                setIsSuccess(true);
                toast.success('Password reset successful!');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <Card className="gradient-card border-border/50">
                        <CardHeader className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                            <CardTitle className="text-2xl">Password Reset!</CardTitle>
                            <CardDescription>
                                Your password has been successfully reset. You can now log in with your new password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => navigate('/login')} className="w-full">
                                Go to Login
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
                <Card className="gradient-card border-border/50 max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl text-destructive">Invalid Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/forgot-password">
                            <Button className="w-full">Request New Link</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="gradient-card border-border/50">
                    <CardHeader className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Reset Password</CardTitle>
                        <CardDescription>
                            Enter your new password below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                            <Link to="/login" className="block">
                                <Button variant="ghost" className="w-full gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Button>
                            </Link>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
