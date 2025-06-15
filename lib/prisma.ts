import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { users, projects, usersRelations, projectsRelations } from './schema'

const connectionString = process.env.DATABASE_URL!

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, {
  schema: {
    users,
    projects,
    usersRelations,
    projectsRelations,
  },
})

export type Database = typeof db
