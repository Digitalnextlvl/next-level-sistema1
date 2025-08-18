import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRemoverUsuario, type UserProfile } from '@/hooks/useConfiguracoes';
import { useToast } from '@/hooks/use-toast';

interface RemoveUserDialogProps {
  user: UserProfile;
  trigger?: React.ReactNode;
}

export function RemoveUserDialog({ user, trigger }: RemoveUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const removeUserMutation = useRemoverUsuario();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senha.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite a senha.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await removeUserMutation.mutateAsync({
        userId: user.user_id,
        senha
      });
      
      setOpen(false);
      setSenha('');
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const defaultTrigger = (
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4 mr-1" />
      Remover
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remover Usuário
          </DialogTitle>
          <DialogDescription>
            Você está prestes a remover o usuário <strong>{user.name}</strong> ({user.email}).
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="senha">
                Digite a senha de confirmação:
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha..."
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false);
                setSenha('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={removeUserMutation.isPending || !senha.trim()}
            >
              {removeUserMutation.isPending ? 'Removendo...' : 'Remover Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}