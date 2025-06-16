'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Github } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z
    .object({
        email: z.string().email('Неверний формат email'),
        password: z.string().min(6, 'Пароль повинен містити мінімум 6 символів'),
        confirmPassword: z.string().min(6, 'Підтвердіть пароль'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Паролі не співпадають',
        path: ['confirmPassword'],
    });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            if (res.ok) {
                toast({
                    title: 'Успіх!',
                    description: 'Акаунт створено успішно!',
                });
                
                // Auto-login after successful registration
                const signInResult = await signIn('credentials', {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                });
                
                if (signInResult?.error) {
                    toast({
                        variant: 'destructive',
                        title: 'Увага',
                        description: 'Акаунт створено, але виникла помилка при автоматичному вході',
                    });
                    router.push('/auth/login');
                } else {
                    toast({
                        title: 'Успіх!',
                        description: 'Успішний вхід!',
                    });
                    router.push('/dashboard');
                }
            } else {
                const error = await res.json();
                toast({
                    variant: 'destructive',
                    title: 'Помилка реєстрації',
                    description: error.message || 'Сталася помилка при реєстрації',
                });
            }
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Сталася помилка при реєстрації',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary">
                        <Github className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">Створити акаунт</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Або{' '}
                        <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
                            увійти в існуючий акаунт
                        </Link>
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Створити новий акаунт</CardTitle>
                        <CardDescription>
                            Заповніть форму для створення нового акаунту
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                                        autoComplete="new-password"
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
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Підтвердіть пароль</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Підтвердіть пароль"
                                                        autoComplete="new-password"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
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
                                    {isLoading ? 'Створюємо акаунт...' : 'Створити акаунт'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
