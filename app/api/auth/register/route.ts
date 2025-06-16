import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UserModel } from '@/lib/model/user.model'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    // Перевіряємо, чи існує користувач
    if (await UserModel.exists(email)) {
      return NextResponse.json(
        { message: 'Користувач з таким email вже існує' },
        { status: 400 }
      )
    }

    // Створюємо користувача
    const user = await UserModel.create({
      email,
      password,
    })

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