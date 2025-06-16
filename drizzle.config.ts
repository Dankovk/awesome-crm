import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
        port: Number.parseInt(process.env.DATABASE_PORT!),
        ssl: process.env.DATABASE_SSL === 'true',
    },
    verbose: false,
    strict: false,
});
