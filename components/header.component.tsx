'use client';

import { Button } from '@/components/ui/button';
import { Github, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/util/cn';

interface HeaderProps {
    transparent?: boolean;
    className?: string;
}

export function Header({ transparent = false, className }: HeaderProps) {
    const { data: session } = useSession();

    return (
        <header className={cn(
            "border-b border-border z-30 fixed top-0 left-0 right-0",
            transparent 
                ? "absolute top-0 left-0 right-0 bg-card/80 backdrop-blur-sm shadow-sm" 
                : "bg-card shadow-sm",
            className
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Github className="h-8 w-8 text-primary mr-3" />
                        <h1 className="text-xl font-semibold text-foreground">GitHub CRM</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                            Привіт, {session?.user?.email}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Вийти
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
} 