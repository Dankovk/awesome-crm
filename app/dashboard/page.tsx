'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, RefreshCw, Trash2, Star, GitFork, AlertCircle, Calendar, LogOut, Github } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AddProjectModal } from '@/components/AddProjectModal'
import { format } from 'date-fns'

interface Project {
  id: string
  owner: string
  name: string
  url: string
  stars: number
  forks: number
  issues: number
  createdAt: string
  updatedAt: string
  description?: string
  language?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchProjects()
  }, [session, status, router])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      } else {
        toast.error('Помилка при завантаженні проєктів')
      }
    } catch (error) {
      toast.error('Помилка при завантаженні проєктів')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async (projectId: string) => {
    setUpdatingProjects(prev => new Set(prev).add(projectId))
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT'
      })
      
      if (res.ok) {
        const updatedProject = await res.json()
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p))
        toast.success('Проєкт оновлено')
      } else {
        toast.error('Помилка при оновленні проєкту')
      }
    } catch (error) {
      toast.error('Помилка при оновленні проєкту')
    } finally {
      setUpdatingProjects(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей проєкт?')) {
      return
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        toast.success('Проєкт видалено')
      } else {
        toast.error('Помилка при видаленні проєкту')
      }
    } catch (error) {
      toast.error('Помилка при видаленні проєкту')
    }
  }

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Github className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">GitHub CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Привіт, {session?.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Вийти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Мої проєкти</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Додати проєкт
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Github className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Немає проєктів</h3>
              <p className="mt-1 text-sm text-gray-500">
                Почніть з додавання вашого першого GitHub репозиторію.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Додати проєкт
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Github className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {project.owner}/{project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {project.stars}
                      </div>
                      <div className="flex items-center">
                        <GitFork className="h-4 w-4 mr-1" />
                        {project.forks}
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {project.issues}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(project.createdAt), 'dd.MM.yyyy')}
                      </div>
                      {project.language && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.language}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleUpdateProject(project.id)}
                        disabled={updatingProjects.has(project.id)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${updatingProjects.has(project.id) ? 'animate-spin' : ''}`} />
                        Оновити
                      </button>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Відкрити
                      </a>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProject}
      />
    </div>
  )
}