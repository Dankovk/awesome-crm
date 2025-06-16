import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider.component';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider.component';
import { ThemeToggle } from '@/components/theme-toggle.component';
import { DotBackground } from '@/components/dot-background.component';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GitHub CRM',
    description: 'Simple project management system for GitHub repositories',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange={false}
                >
                    <AuthProvider>
                        <DotBackground>
                            
                            {children}
                        </DotBackground>
                        <Toaster />
                    </AuthProvider>
                    {/* Fixed theme toggle in bottom right corner */}
                    <div className="fixed bottom-4 right-4 z-50">
                        <ThemeToggle />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
