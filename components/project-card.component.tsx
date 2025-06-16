import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Project } from '@/lib/db/schema';
import { format } from 'date-fns';
import { AlertCircle, Calendar, GitFork, Github, RefreshCw, Star, Trash2 } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    isUpdating: boolean;
    onUpdate: (projectId: string) => void;
    onDelete: (project: Project) => void;
}

export function ProjectCard({ project, isUpdating, onUpdate, onDelete }: ProjectCardProps) {
    return (
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
            <GlowingEffect
                blur={0}
                borderWidth={3}
                spread={80}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
            />
            <Card className="border-0 h-full relative overflow-hidden">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Github className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">
                            {project.owner}/{project.name}
                        </CardTitle>
                    </div>
                    {project.description && (
                        <CardDescription>{project.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(project.createdAt), 'dd.MM.yyyy')}
                        </div>
                        {project.language && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                {project.language}
                            </span>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdate(project.id)}
                            disabled={isUpdating}
                            className="flex-1"
                        >
                            <RefreshCw
                                className={`h-4 w-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`}
                            />
                            Оновити
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1"
                        >
                            <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Відкрити
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(project)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
