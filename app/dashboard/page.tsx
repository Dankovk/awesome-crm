'use client';

import { AddProjectModal } from '@/components/add-project-modal.component';
import { LoadingSpinner } from '@/components/loading-spinner.component';
import { DotBackground } from '@/components/dot-background.component';
import { Header } from '@/components/header.component';
import { ProjectCard } from '@/components/project-card.component';
import { DeleteProjectDialog } from '@/components/delete-project-dialog.component';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast.hook';
import { Github, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type Project } from '@/lib/db/schema';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set());
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/login');
            return;
        }

        fetchProjects();
    }, [session, status, router]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Помилка',
                    description: 'Помилка при завантаженні проєктів',
                });
            }
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Помилка при завантаженні проєктів',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProject = async (projectId: string) => {
        setUpdatingProjects((prev) => new Set(prev).add(projectId));

        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
            });

            if (res.ok) {
                const updatedProject = await res.json();
                setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));
                toast({
                    title: 'Успіх!',
                    description: 'Проєкт оновлено',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Помилка',
                    description: 'Помилка при оновленні проєкту',
                });
            }
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Помилка при оновленні проєкту',
            });
        } finally {
            setUpdatingProjects((prev) => {
                const newSet = new Set(prev);
                newSet.delete(projectId);
                return newSet;
            });
        }
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            const res = await fetch(`/api/projects/${projectToDelete.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
                toast({
                    title: 'Успіх!',
                    description: 'Проєкт видалено',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Помилка',
                    description: 'Помилка при видаленні проєкту',
                });
            }
        } catch (_error) {
            toast({
                variant: 'destructive',
                title: 'Помилка',
                description: 'Помилка при видаленні проєкту',
            });
        } finally {
            setDeleteConfirmOpen(false);
            setProjectToDelete(null);
        }
    };

    const openDeleteConfirmation = (project: Project) => {
        setProjectToDelete(project);
        setDeleteConfirmOpen(true);
    };

    const handleAddProject = (newProject: Project) => {
        setProjects((prev) => [newProject, ...prev]);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Empty state with dot background
    if (projects.length === 0) {
        return (
            <DotBackground>
                
                <Header transparent />

                
                <div className="flex flex-col items-center justify-center text-center px-4">
                    <Github className="h-16 w-16 text-muted-foreground mb-6" />
                    <h2 className="text-3xl font-bold text-foreground mb-2">Немає проєктів</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        Почніть з додавання вашого першого GitHub репозиторію.
                    </p>
                    <Button onClick={() => setShowAddModal(true)} size="lg">
                        <Plus className="h-5 w-5 mr-2" />
                        Додати проєкт
                    </Button>
                </div>

                
                <AddProjectModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProject} />
            </DotBackground>
        );
    }

    // Normal dashboard with projects
    return (
        <div className="min-h-screen pt-16">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Мої проєкти</h2>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Додати проєкт
                        </Button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                isUpdating={updatingProjects.has(project.id)}
                                onUpdate={handleUpdateProject}
                                onDelete={openDeleteConfirmation}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* Add Project Modal */}
            <AddProjectModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProject} />

            {/* Delete Confirmation Dialog */}
            <DeleteProjectDialog
                isOpen={deleteConfirmOpen}
                project={projectToDelete}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteProject}
            />
        </div>
    );
}
