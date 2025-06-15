import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { db } from '@/lib/prisma'
import { projects, users } from '@/lib/schema'
import { eq, desc, and } from 'drizzle-orm'
import { z } from 'zod'

const createProjectSchema = z.object({
  repoPath: z.string().regex(/^[\w\-\.]+\/[\w\-\.]+$/, 'Неверный формат пути к репозиторию (например: facebook/react)'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, session.user.id))
      .orderBy(desc(projects.createdAt))

    return NextResponse.json(userProjects)
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { message: 'Ошибка при загрузке проектов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { repoPath } = createProjectSchema.parse(body)

    const [owner, name] = repoPath.split('/')

    // Get user info including GitHub token
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    
    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем, не существует ли уже такой проект у пользователя
    const existingProject = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, session.user.id),
          eq(projects.owner, owner),
          eq(projects.name, name)
        )
      )
      .limit(1)

    if (existingProject[0]) {
      return NextResponse.json(
        { message: 'Этот репозиторий уже добавлен' },
        { status: 400 }
      )
    }

    // Try to get GitHub data - first without authentication for public repos
    let githubResponse
    let githubData

    // First attempt: Try without authentication (for public repos)
    try {
      githubResponse = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-CRM-App',
        },
      })

      if (githubResponse.ok) {
        githubData = await githubResponse.json()
      } else if (githubResponse.status === 404 || githubResponse.status === 403) {
        // Repository might be private, try with token if available
        const githubToken = user.githubToken || process.env.GITHUB_TOKEN
        
        if (githubToken) {
          githubResponse = await fetch(`https://api.github.com/repos/${repoPath}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'GitHub-CRM-App',
              'Authorization': `token ${githubToken}`,
            },
          })

          if (githubResponse.ok) {
            githubData = await githubResponse.json()
          }
        }
      }
    } catch (error) {
      console.error('GitHub API fetch error:', error)
    }

    // Handle the response
    if (!githubResponse || !githubResponse.ok) {
      if (githubResponse?.status === 404) {
        return NextResponse.json(
          { message: 'Репозиторий не найден или является приватным' },
          { status: 404 }
        )
      }
      if (githubResponse?.status === 403) {
        return NextResponse.json(
          { message: 'Доступ запрещен. Возможно, репозиторий приватный и требует GitHub токен.' },
          { status: 403 }
        )
      }
      if (githubResponse?.status === 401) {
        return NextResponse.json(
          { message: 'Неверный GitHub токен. Войдите через GitHub для доступа к приватным репозиториям.' },
          { status: 401 }
        )
      }
      if (githubResponse?.status === 429) {
        return NextResponse.json(
          { message: 'Превышен лимит запросов к GitHub API. Попробуйте позже или войдите через GitHub.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { message: 'Ошибка при получении данных из GitHub API' },
        { status: 500 }
      )
    }

    if (!githubData) {
      return NextResponse.json(
        { message: 'Не удалось получить данные репозитория' },
        { status: 500 }
      )
    }

    // Создаём проект в базе данных
    const [project] = await db.insert(projects).values({
      owner,
      name,
      url: githubData.html_url,
      stars: githubData.stargazers_count,
      forks: githubData.forks_count,
      issues: githubData.open_issues_count,
      githubId: githubData.id,
      description: githubData.description,
      language: githubData.language,
      userId: session.user.id,
    }).returning()

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Create project error:', error)
    return NextResponse.json(
      { message: 'Ошибка при создании проекта' },
      { status: 500 }
    )
  }
} 