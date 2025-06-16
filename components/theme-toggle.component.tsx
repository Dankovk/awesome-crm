'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    {theme === 'light' ? (
                        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
                    ) : theme === 'dark' ? (
                        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
                    ) : (
                        <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-64">
                <DialogHeader>
                    <DialogTitle>Choose theme</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                    <Button
                        variant={theme === 'light' ? 'default' : 'ghost'}
                        onClick={() => setTheme('light')}
                        className="justify-start"
                    >
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </Button>
                    <Button
                        variant={theme === 'dark' ? 'default' : 'ghost'}
                        onClick={() => setTheme('dark')}
                        className="justify-start"
                    >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </Button>
                    <Button
                        variant={theme === 'system' ? 'default' : 'ghost'}
                        onClick={() => setTheme('system')}
                        className="justify-start"
                    >
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 