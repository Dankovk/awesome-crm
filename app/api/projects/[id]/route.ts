import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { db } from '@/lib/prisma'
import { projects, users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Не авторизований' }, { status: 401 })
    }

    const project = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1)

    if (!project[0]) {
      return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 })
    }

    if (project[0].userId !== session.user.id) {
      return NextResponse.json({ message: 'Немає доступу' }, { status: 403 })
    }

    // Get user info including GitHub token
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)
    
    // Use user's GitHub token if available, otherwise try without authentication for public repos
    const githubToken = user?.githubToken || process.env.GITHUB_TOKEN

    // Prepare headers - include Authorization only if we have a token
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-CRM-App', // GitHub requires a User-Agent header
    }

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }

    // Отримуємо свіжі дані з GitHub API
    const repoPath = `${project[0].owner}/${project[0].name}`
    const githubResponse = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers,
    })

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { message: 'Репозиторій не знайдено або став приватним' },
          { status: 404 }
        )
      }
      if (githubResponse.status === 403) {
        return NextResponse.json(
          { message: 'Доступ заборонено. Можливо, репозиторій став приватним і требує GitHub токен.' },
          { status: 403 }
        )
      }
      if (githubResponse.status === 429) {
        return NextResponse.json(
          { message: 'Перевищено ліміт запитів до GitHub API. Спробуйте пізніше.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { message: 'Помилка при оновленні даних з GitHub' },
        { status: 500 }
      )
    }

    const githubData = await githubResponse.json()

    // Оновлюємо проєкт
    const [updatedProject] = await db
      .update(projects)
      .set({
        stars: githubData.stargazers_count,
        forks: githubData.forks_count,
        issues: githubData.open_issues_count,
        description: githubData.description,
        language: githubData.language,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, params.id))
      .returning()

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { message: 'Помилка при оновленні проєкту' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Не авторизований' }, { status: 401 })
    }

    const project = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1)

    if (!project[0]) {
      return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 })
    }

    if (project[0].userId !== session.user.id) {
      return NextResponse.json({ message: 'Немає доступу' }, { status: 403 })
    }

    await db.delete(projects).where(eq(projects.id, params.id))

    return NextResponse.json({ message: 'Проєкт видалено' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { message: 'Помилка при видаленні проєкту' },
      { status: 500 }
    )
  }
} 