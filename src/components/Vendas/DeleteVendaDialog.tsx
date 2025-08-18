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
import { useDeleteVenda, type Venda } from "@/hooks/useVendas";

interface DeleteVendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venda?: Venda;
}

export function DeleteVendaDialog({ open, onOpenChange, venda }: DeleteVendaDialogProps) {
  const deleteVenda = useDeleteVenda();

  const handleDelete = async () => {
    if (!venda) return;
    
    try {
      await deleteVenda.mutateAsync(venda.id);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Venda</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a venda para{" "}
            <strong>{venda?.cliente?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteVenda.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={deleteVenda.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteVenda.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}