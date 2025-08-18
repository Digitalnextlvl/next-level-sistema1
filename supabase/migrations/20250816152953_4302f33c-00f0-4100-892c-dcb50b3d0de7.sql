-- Criar política RLS para permitir que administradores removam outros usuários
CREATE POLICY "Admins can delete other profiles" 
ON public.profiles 
FOR DELETE 
USING (
  get_current_user_role() = 'admin' AND auth.uid() != user_id
);