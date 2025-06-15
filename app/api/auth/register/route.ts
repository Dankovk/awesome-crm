import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    // Перевіряємо, чи існує користувач
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUser[0]) {
      return NextResponse.json(
        { message: 'Користувач з таким email вже існує' },
        { status: 400 }
      )
    }

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date()

    // Створюємо користувача
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return NextResponse.json(
      { message: 'Користувача створено успішно', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неправильні дані', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера' },
      { status: 500 }
    )
  }
} 