-- Atualizar políticas RLS para dashboard_images
-- Permitir que todos vejam imagens ativas, mas apenas admins gerenciem

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view dashboard_images" ON public.dashboard_images;
DROP POLICY IF EXISTS "Admins can create dashboard_images" ON public.dashboard_images;
DROP POLICY IF EXISTS "Admins can update dashboard_images" ON public.dashboard_images;
DROP POLICY IF EXISTS "Admins can delete dashboard_images" ON public.dashboard_images;

-- Nova política para visualização: todos podem ver imagens ativas
CREATE POLICY "Everyone can view active dashboard_images" 
ON public.dashboard_images 
FOR SELECT 
USING (ativo = true);

-- Políticas para gerenciamento: apenas admins
CREATE POLICY "Admins can create dashboard_images" 
ON public.dashboard_images 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update dashboard_images" 
ON public.dashboard_images 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete dashboard_images" 
ON public.dashboard_images 
FOR DELETE 
USING (get_current_user_role() = 'admin');