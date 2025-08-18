-- Criar tabela de metas de faturamento
CREATE TABLE public.metas_faturamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mes_ano DATE NOT NULL,
  meta_faturamento DECIMAL(12,2) NOT NULL,
  meta_vendas INTEGER DEFAULT 0,
  meta_novos_clientes INTEGER DEFAULT 0,
  meta_contratos INTEGER DEFAULT 0,
  bonus_meta DECIMAL(12,2) DEFAULT 0,
  descricao TEXT,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mes_ano)
);

-- Enable RLS
ALTER TABLE public.metas_faturamento ENABLE ROW LEVEL SECURITY;

-- RLS Policies para metas de faturamento
CREATE POLICY "Admins can view metas_faturamento" 
ON public.metas_faturamento FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create metas_faturamento" 
ON public.metas_faturamento FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update metas_faturamento" 
ON public.metas_faturamento FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete metas_faturamento" 
ON public.metas_faturamento FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_metas_faturamento_updated_at
  BEFORE UPDATE ON public.metas_faturamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir meta exemplo para o mês atual
INSERT INTO public.metas_faturamento (user_id, mes_ano, meta_faturamento, meta_vendas, meta_novos_clientes, meta_contratos, descricao) VALUES
('00000000-0000-0000-0000-000000000000', DATE_TRUNC('month', CURRENT_DATE), 50000.00, 20, 15, 10, 'Meta principal do mês')
ON CONFLICT DO NOTHING;