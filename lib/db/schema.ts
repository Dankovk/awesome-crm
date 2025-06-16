import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('User', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    password: text('password').notNull(), // Can be empty for OAuth users
    githubId: text('githubId').unique(),
    githubToken: text('githubToken'),
    createdAt: timestamp('createdAt')
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp('updatedAt')
        .$defaultFn(() => new Date())
        .notNull(),
});

export const projects = pgTable('Project', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    owner: text('owner').notNull(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    stars: integer('stars').default(0).notNull(),
    forks: integer('forks').default(0).notNull(),
    issues: integer('issues').default(0).notNull(),
    githubId: integer('githubId').notNull(),
    description: text('description'),
    language: text('language'),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt')
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp('updatedAt')
        .$defaultFn(() => new Date())
        .notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
    user: one(users, {
        fields: [projects.userId],
        references: [users.id],
    }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
