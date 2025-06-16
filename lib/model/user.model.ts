import { db } from '@/lib/db/db'
import { users, type User, type NewUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserData = Partial<Pick<NewUser, 'githubId' | 'githubToken'>> & {
  updatedAt?: Date
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0] || null
  }

  static async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0] || null
  }

  static async create(userData: CreateUserData): Promise<User> {
    const now = new Date()
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : ''

    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return user
  }

  static async update(id: string, updateData: UpdateUserData): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: updateData.updatedAt || new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return user
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  static async exists(email: string) {
    const user = await this.findByEmail(email)
    return !!user
  }
} 