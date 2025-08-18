-- Criar bucket para imagens do dashboard
INSERT INTO storage.buckets (id, name, public) VALUES ('dashboard-images', 'dashboard-images', true);

-- Criar tabela para gerenciar imagens do dashboard
CREATE TABLE public.dashboard_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url_imagem TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  tipo TEXT DEFAULT 'banner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies para dashboard_images
CREATE POLICY "Admins can view dashboard_images" 
ON public.dashboard_images FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create dashboard_images" 
ON public.dashboard_images FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update dashboard_images" 
ON public.dashboard_images FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete dashboard_images" 
ON public.dashboard_images FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies para storage bucket dashboard-images
CREATE POLICY "Admins can upload dashboard images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'dashboard-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view dashboard images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'dashboard-images');

CREATE POLICY "Admins can update dashboard images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'dashboard-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete dashboard images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'dashboard-images' AND auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE TRIGGER update_dashboard_images_updated_at
  BEFORE UPDATE ON public.dashboard_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir imagens padrão existentes
INSERT INTO public.dashboard_images (user_id, titulo, descricao, url_imagem, ordem, tipo) VALUES
('00000000-0000-0000-0000-000000000000', 'Banner Principal', 'Imagem principal do dashboard', '/assets/banner1.jpg', 1, 'banner'),
('00000000-0000-0000-0000-000000000000', 'Banner Secundário', 'Segunda imagem do carousel', '/assets/banner2.jpg', 2, 'banner'),
('00000000-0000-0000-0000-000000000000', 'Banner Terciário', 'Terceira imagem do carousel', '/assets/banner3.jpg', 3, 'banner')
ON CONFLICT DO NOTHING;