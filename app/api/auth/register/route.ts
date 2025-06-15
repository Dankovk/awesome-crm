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

    // Проверяем, существует ли пользователь
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUser[0]) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12)
    const now = new Date()

    // Создаём пользователя
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return NextResponse.json(
      { message: 'Пользователь создан успешно', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 