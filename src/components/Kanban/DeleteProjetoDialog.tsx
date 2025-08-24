import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProjetos } from "@/hooks/useProjetos";

interface DeleteProjetoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: {
    id: string;
    nome: string;
  } | null;
}

export function DeleteProjetoDialog({ open, onOpenChange, projeto }: DeleteProjetoDialogProps) {
  const { deleteProjeto } = useProjetos();

  const handleDelete = async () => {
    if (!projeto) return;

    try {
      await deleteProjeto.mutateAsync(projeto.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o projeto "{projeto?.nome}"? Esta ação não pode ser desfeita.
            Todas as tarefas associadas a este projeto serão perdidas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteProjeto.isPending}
          >
            {deleteProjeto.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}