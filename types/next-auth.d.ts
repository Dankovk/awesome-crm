import { type User } from '@/lib/db/schema';
import 'next-auth';

type UserId = string;

declare module 'next-auth' {
    interface Session {
        user: User;
        accessToken?: string;
    }
    interface Profile {
        id: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: UserId;
        accessToken?: string;
    }
} 