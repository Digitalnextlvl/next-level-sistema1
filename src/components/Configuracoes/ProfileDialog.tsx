import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AvatarUploader } from './AvatarUploader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileDialogProps {
  trigger?: React.ReactNode;
}

export function ProfileDialog({ trigger }: ProfileDialogProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    telefone: user?.telefone || '',
    endereco: user?.endereco || '',
  });

  // Atualizar dados quando o usuário do contexto mudar
  React.useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        name: user.name || '',
        telefone: user.telefone || '',
        endereco: user.endereco || '',
      });
    }
  }, [user]);

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    const updatedUser = { ...currentUser, avatar_url: avatarUrl || undefined };
    setCurrentUser(updatedUser);
    // Atualizar o contexto global também
    updateUser({ avatar_url: avatarUrl || undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
        })
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Atualizar estado local e contexto global
      const updatedUserData = {
        ...currentUser,
        name: formData.name,
        telefone: formData.telefone,
        endereco: formData.endereco,
      };
      setCurrentUser(updatedUserData);
      updateUser({ 
        name: formData.name,
        telefone: formData.telefone,
        endereco: formData.endereco 
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao salvar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <AvatarUploader currentUser={currentUser} onAvatarUpdate={handleAvatarUpdate} />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={currentUser?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O email não pode ser alterado
              </p>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Digite seu endereço"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}