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
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const project = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1)

    if (!project[0]) {
      return NextResponse.json({ message: 'Проект не найден' }, { status: 404 })
    }

    if (project[0].userId !== session.user.id) {
      return NextResponse.json({ message: 'Нет доступа' }, { status: 403 })
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

    // Получаем свежие данные из GitHub API
    const repoPath = `${project[0].owner}/${project[0].name}`
    const githubResponse = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers,
    })

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { message: 'Репозиторий не найден или стал приватным' },
          { status: 404 }
        )
      }
      if (githubResponse.status === 403) {
        return NextResponse.json(
          { message: 'Доступ запрещен. Возможно, репозиторий стал приватным и требует GitHub токен.' },
          { status: 403 }
        )
      }
      if (githubResponse.status === 429) {
        return NextResponse.json(
          { message: 'Превышен лимит запросов к GitHub API. Попробуйте позже.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { message: 'Ошибка при обновлении данных из GitHub' },
        { status: 500 }
      )
    }

    const githubData = await githubResponse.json()

    // Обновляем проект
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
      { message: 'Ошибка при обновлении проекта' },
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
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const project = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1)

    if (!project[0]) {
      return NextResponse.json({ message: 'Проект не найден' }, { status: 404 })
    }

    if (project[0].userId !== session.user.id) {
      return NextResponse.json({ message: 'Нет доступа' }, { status: 403 })
    }

    await db.delete(projects).where(eq(projects.id, params.id))

    return NextResponse.json({ message: 'Проект удален' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { message: 'Ошибка при удалении проекта' },
      { status: 500 }
    )
  }
} 