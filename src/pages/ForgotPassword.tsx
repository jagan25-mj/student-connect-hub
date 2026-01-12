import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.forgotPassword(email.trim());
            if (response.success) {
                setIsSuccess(true);
                toast.success('Check your email for reset instructions');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
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
                            <CardTitle className="text-2xl">Check Your Email</CardTitle>
                            <CardDescription>
                                If an account with <strong>{email}</strong> exists, we've sent password reset instructions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSuccess(false)}
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                                <Link to="/login" className="w-full">
                                    <Button variant="ghost" className="w-full gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
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
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                        <CardDescription>
                            Enter your email address and we'll send you instructions to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
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
