'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { X, Github, Info } from 'lucide-react'

const addProjectSchema = z.object({
  repoPath: z.string()
    .min(1, 'Поле обязательно для заполнения')
    .regex(/^[\w\-\.]+\/[\w\-\.]+$/, 'Неверный формат пути (например: facebook/react)'),
})

type AddProjectForm = z.infer<typeof addProjectSchema>

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

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (project: Project) => void
}

export function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddProjectForm>({
    resolver: zodResolver(addProjectSchema),
  })

  const onSubmit = async (data: AddProjectForm) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        const newProject = await res.json()
        onAdd(newProject)
        toast.success('Проект добавлен успешно!')
        reset()
        onClose()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Ошибка при добавлении проекта')
      }
    } catch (error) {
      toast.error('Ошибка при добавлении проекта')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary sm:mx-0 sm:h-10 sm:w-10">
                <Github className="h-6 w-6 text-white" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Добавить новый проект
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Введите путь к GitHub репозиторию в формате owner/repository
                  </p>
                  
                  {/* Info about public repos */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex">
                      <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium">Публичные репозитории</p>
                        <p className="mt-1">
                          Вы можете добавлять публичные репозитории без GitHub токена. 
                          Для приватных репозиториев войдите через GitHub.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div>
                    <label htmlFor="repoPath" className="block text-sm font-medium text-gray-700">
                      Путь к репозиторию
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('repoPath')}
                        type="text"
                        placeholder="Например: facebook/react"
                        className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.repoPath && (
                      <p className="mt-1 text-sm text-red-600">{errors.repoPath.message}</p>
                    )}
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Добавляем...' : 'Добавить'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
} 