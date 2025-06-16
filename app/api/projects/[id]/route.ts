import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProjectModel, type GitHubRepoData } from '@/lib/entity/project'
import { UserModel } from '@/lib/entity/user'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Не авторизований' }, { status: 401 })
    }

    const { id } = await params
    const project = await ProjectModel.findById(id)

    if (!project) {
      return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 })
    }

    if (!await ProjectModel.belongsToUser(id, session.user.id)) {
      return NextResponse.json({ message: 'Немає доступу' }, { status: 403 })
    }

    // Get user info including GitHub token
    const user = await UserModel.findById(session.user.id)
    
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
    const repoPath = `${project.owner}/${project.name}`
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
          { message: 'Доступ заборонено. Можливо, репозиторій став приватним і потребує GitHub токен.' },
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

    const githubData: GitHubRepoData = await githubResponse.json()

    // Оновлюємо проєкт
    const updatedProject = await ProjectModel.updateFromGitHub(id, githubData)

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Не авторизований' }, { status: 401 })
    }

    const { id } = await params
    const project = await ProjectModel.findById(id)

    if (!project) {
      return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 })
    }

    if (!await ProjectModel.belongsToUser(id, session.user.id)) {
      return NextResponse.json({ message: 'Немає доступу' }, { status: 403 })
    }

    await ProjectModel.delete(id)

    return NextResponse.json({ message: 'Проєкт видалено' })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { message: 'Помилка при видаленні проєкту' },
      { status: 500 }
    )
  }
} 