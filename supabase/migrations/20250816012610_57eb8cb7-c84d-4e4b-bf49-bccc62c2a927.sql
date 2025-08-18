-- Criar função de segurança para obter o role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Atualizar a política RLS de SELECT para clientes
-- Admins podem ver todos os clientes, vendedores só veem os seus
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clientes;

CREATE POLICY "Users can view clients based on role" 
ON public.clientes 
FOR SELECT 
USING (
  (public.get_current_user_role() = 'admin') OR 
  (auth.uid() = user_id)
);