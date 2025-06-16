import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Project {
    id: string;
    owner: string;
    name: string;
    url: string;
    stars: number;
    forks: number;
    issues: number;
    createdAt: string;
    updatedAt: string;
    description?: string;
    language?: string;
}

interface DeleteProjectDialogProps {
    isOpen: boolean;
    project: Project | null;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteProjectDialog({ isOpen, project, onClose, onConfirm }: DeleteProjectDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Видалити проєкт?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ви впевнені, що хочете видалити проєкт <strong>{project?.owner}/{project?.name}</strong>?
                        Цю дію неможливо скасувати.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Відміна</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Видалити
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 