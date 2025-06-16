import { UserModel } from '@/lib/model/user.model';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: AuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await UserModel.findByEmail(credentials.email);

                if (!user) {
                    return null;
                }

                const isPasswordValid = await UserModel.verifyPassword(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'github') {
                try {
                    // Check if user exists
                    const existingUser = await UserModel.findByEmail(user.email!);

                    if (!existingUser) {
                        const newUser = await UserModel.create({
                            email: user.email!,
                            password: '', // No password for OAuth users
                            githubId: (profile as any)?.id?.toString(),
                            githubToken: account.access_token || '',
                        });

                        user.id = newUser.id;
                    } else {
                        const updatedUser = await UserModel.update(existingUser.id, {
                            githubId: (profile as any)?.id?.toString(),
                            githubToken: account.access_token || '',
                        });

                        user.id = updatedUser.id;
                    }
                } catch (error) {
                    console.error('GitHub sign-in error:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                if (token.accessToken) {
                    session.accessToken = token.accessToken as string;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    debug: process.env.NODE_ENV === 'development',
};
