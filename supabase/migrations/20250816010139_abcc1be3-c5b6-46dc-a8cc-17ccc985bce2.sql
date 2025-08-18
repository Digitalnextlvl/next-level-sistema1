-- Criar bucket para PDFs dos contratos
INSERT INTO storage.buckets (id, name, public) VALUES ('contratos-pdf', 'contratos-pdf', false);

-- Adicionar campo para URL do PDF na tabela contratos primeiro
ALTER TABLE public.contratos 
ADD COLUMN pdf_url TEXT;

-- Remover campos desnecessários da tabela contratos
ALTER TABLE public.contratos 
DROP COLUMN IF EXISTS numero_contrato,
DROP COLUMN IF EXISTS titulo,
DROP COLUMN IF EXISTS descricao,
DROP COLUMN IF EXISTS observacoes;

-- Criar políticas para o bucket contratos-pdf
CREATE POLICY "Users can view their own contract PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contratos-pdf' AND EXISTS (
  SELECT 1 FROM contratos 
  WHERE contratos.pdf_url = storage.objects.name 
  AND contratos.user_id = auth.uid()
));

CREATE POLICY "Users can upload their own contract PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contratos-pdf' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own contract PDFs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contratos-pdf' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own contract PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'contratos-pdf' AND auth.uid()::text = (storage.foldername(name))[1]);