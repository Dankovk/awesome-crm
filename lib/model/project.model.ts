import { db } from '@/lib/db/db'
import { projects, type Project, type NewProject } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export type CreateProjectData = Omit<NewProject, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProjectData = Partial<Pick<NewProject, 'description' | 'language' | 'stars' | 'forks' | 'issues'>> & {
  updatedAt?: Date
}

export interface GitHubRepoData {
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  description: string | null
  language: string | null
}

export class ProjectModel {
  static async findById(id: string): Promise<Project | null> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
    return result[0] || null
  }

  static async findByUserAndRepo(userId: string, owner: string, name: string): Promise<Project | null> {
    const result = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          eq(projects.owner, owner),
          eq(projects.name, name)
        )
      )
      .limit(1)
    
    return result[0] || null
  }

  static async findByUserId(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt))
  }

  static async create(projectData: CreateProjectData): Promise<Project> {
    const now = new Date()

    const [project] = await db.insert(projects).values({
      ...projectData,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return project
  }

  static async update(id: string, updateData: UpdateProjectData): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({
        ...updateData,
        updatedAt: updateData.updatedAt || new Date(),
      })
      .where(eq(projects.id, id))
      .returning()

    return project
  }

  static async updateFromGitHub(id: string, githubData: GitHubRepoData): Promise<Project> {
    return this.update(id, {
      stars: githubData.stargazers_count,
      forks: githubData.forks_count,
      issues: githubData.open_issues_count,
      description: githubData.description || undefined,
      language: githubData.language || undefined,
    })
  }

  static async delete(id: string) {
    await db.delete(projects).where(eq(projects.id, id))
  }

  static async exists(userId: string, owner: string, name: string) {
    const project = await this.findByUserAndRepo(userId, owner, name)
    return !!project
  }

  static async belongsToUser(projectId: string, userId: string) {
    const project = await this.findById(projectId)
    return project?.userId === userId
  }
} 