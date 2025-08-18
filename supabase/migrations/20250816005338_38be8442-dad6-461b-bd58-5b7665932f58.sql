-- Criar tabela contrato_servicos para relacionar contratos com serviços
CREATE TABLE public.contrato_servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL,
  servico_id UUID NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contrato_servicos ENABLE ROW LEVEL SECURITY;

-- Add foreign keys
ALTER TABLE public.contrato_servicos 
ADD CONSTRAINT fk_contrato_servicos_contrato_id 
FOREIGN KEY (contrato_id) 
REFERENCES public.contratos(id) 
ON DELETE CASCADE;

ALTER TABLE public.contrato_servicos 
ADD CONSTRAINT fk_contrato_servicos_servico_id 
FOREIGN KEY (servico_id) 
REFERENCES public.servicos(id) 
ON DELETE CASCADE;

-- Create policies for contrato_servicos
CREATE POLICY "Users can view their own contrato_servicos" 
ON public.contrato_servicos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM contratos 
  WHERE contratos.id = contrato_servicos.contrato_id 
  AND contratos.user_id = auth.uid()
));

CREATE POLICY "Users can create their own contrato_servicos" 
ON public.contrato_servicos 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM contratos 
  WHERE contratos.id = contrato_servicos.contrato_id 
  AND contratos.user_id = auth.uid()
));

CREATE POLICY "Users can update their own contrato_servicos" 
ON public.contrato_servicos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM contratos 
  WHERE contratos.id = contrato_servicos.contrato_id 
  AND contratos.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own contrato_servicos" 
ON public.contrato_servicos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM contratos 
  WHERE contratos.id = contrato_servicos.contrato_id 
  AND contratos.user_id = auth.uid()
));