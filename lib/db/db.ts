import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { projects, projectsRelations, users, usersRelations } from './schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, {
    schema: {
        users,
        projects,
        usersRelations,
        projectsRelations,
    },
});

export type Database = typeof db;
