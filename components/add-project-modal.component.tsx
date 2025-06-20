'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Github, Info } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast.hook';
import { Project } from '@/lib/db/schema';

const addProjectSchema = z.object({
    repoPath: z
        .string()
        .min(1, "Поле обов'язкове для заповнення")
        .regex(/^[\w\-\.]+\/[\w\-\.]+$/, 'Неправильний формат шляху (наприклад: facebook/react)'),
});

type AddProjectForm = z.infer<typeof addProjectSchema>;

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (project: Project) => void;
}

export function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<AddProjectForm>({
        resolver: zodResolver(addProjectSchema),
        defaultValues: {
            repoPath: '',
        },
    });

    const onSubmit = async (data: AddProjectForm) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const newProject = await res.json();
                onAdd(newProject);
                toast({
                    title: 'Успіх!',
                    description: 'Проєкт додано успішно!',
                });
                form.reset();
                onClose();
            } else {
                const error = await res.json();
                toast({
                    variant: 'destructive',
                    title: 'Помилка',
                    description: error.message || 'Помилка при додаванні проєкту',
                });
            }
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Помилка при додаванні проєкту',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <Github className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <DialogTitle>Додати новий проєкт</DialogTitle>
                    </div>
                    <DialogDescription>
                        Введіть шлях до GitHub репозиторію у форматі owner/repository
                    </DialogDescription>
                </DialogHeader>

                {/* Info about public repos */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium">Публічні репозиторії</p>
                            <p className="mt-1">
                                Ви можете додавати публічні репозиторії.
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="repoPath"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Шлях до репозиторію</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Наприклад: facebook/react"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex space-x-2 pt-4">
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading ? 'Додаємо...' : 'Додати'}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                                Відміна
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
