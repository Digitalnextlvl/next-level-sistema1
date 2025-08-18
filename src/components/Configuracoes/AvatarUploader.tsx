import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

interface AvatarUploaderProps {
  currentUser?: any;
  onAvatarUpdate?: (avatarUrl: string | null) => void;
}

export function AvatarUploader({ currentUser, onAvatarUpdate }: AvatarUploaderProps) {
  const { user } = useAuth();
  const displayUser = currentUser || user;
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || !displayUser?.id) {
      toast({
        title: "Erro de validação",
        description: "Arquivo ou usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O avatar deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Remover avatar anterior se existir
      if (displayUser.avatar_url) {
        const oldPath = displayUser.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload do novo avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${displayUser.id}/${fileName}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', displayUser.id);

      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }

      // Atualizar contexto local e global
      onAvatarUpdate?.(publicUrl);

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

    } catch (error) {
      logger.error('Erro no upload de avatar', error);
      toast({
        title: "Erro ao atualizar avatar",
        description: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveAvatar = async () => {
    if (!displayUser?.id || !displayUser.avatar_url) return;

    setIsUploading(true);

    try {
      // Remover URL do perfil
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', displayUser.id);

      if (error) throw error;

      onAvatarUpdate?.(null);

      toast({
        title: "Avatar removido",
        description: "Sua foto de perfil foi removida.",
      });

    } catch (error) {
      logger.error('Erro ao remover avatar', error);
      toast({
        title: "Erro ao remover avatar",
        description: "Ocorreu um erro ao remover a foto de perfil.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative group cursor-pointer" 
        onClick={handleButtonClick}
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayUser?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {displayUser?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="flex gap-2">
        {displayUser?.avatar_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-1" />
            Remover
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}