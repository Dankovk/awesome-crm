'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Github } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast.hook';
import { LoadingSpinner } from '@/components/loading-spinner.component';

const loginSchema = z.object({
    email: z.string().email('Неверний формат email'),
    password: z.string().min(6, 'Пароль повинен містити мінімум 6 символів'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();

    // Redirect if already logged in
    useEffect(() => {
        if (status === 'authenticated' && session) {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    variant: 'destructive',
                    title: 'Помилка входу',
                    description: 'Неправильний email або пароль',
                });
            } else {
                toast({
                    title: 'Успіх!',
                    description: 'Успішний вхід!',
                });
                router.push('/dashboard');
            }
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Сталася помилка при вході',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('github', { callbackUrl: '/dashboard' });
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Помилка входу через GitHub',
            });
            setIsLoading(false);
        }
    };

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-muted-foreground">Завантаження...</p>
                </div>
            </div>
        );
    }

    // Don't render login form if already authenticated
    if (status === 'authenticated') {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary">
                        <Github className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">Увійти в акаунт</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Або{' '}
                        <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">
                            створити новий акаунт
                        </Link>
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Увійти в акаунт</CardTitle>
                        <CardDescription>
                            Введіть свої дані для входу в систему
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* GitHub Sign In Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGitHubSignIn}
                            disabled={isLoading}
                            className="w-full"
                        >
                            <Github className="h-5 w-5 mr-2" />
                            Увійти через GitHub
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">або</span>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email адрес</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Введіть email"
                                                    autoComplete="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Пароль</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Введіть пароль"
                                                        autoComplete="current-password"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? 'Входимо...' : 'Увійти'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
