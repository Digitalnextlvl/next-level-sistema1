-- Criar tabela de serviços
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela servicos
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas para servicos
CREATE POLICY "Users can view their own servicos" 
ON public.servicos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own servicos" 
ON public.servicos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servicos" 
ON public.servicos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servicos" 
ON public.servicos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar tabela de relação venda_servicos
CREATE TABLE public.venda_servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID NOT NULL,
  servico_id UUID NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (venda_id) REFERENCES public.vendas(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES public.servicos(id) ON DELETE CASCADE
);

-- Habilitar RLS na tabela venda_servicos
ALTER TABLE public.venda_servicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas para venda_servicos (baseadas na venda associada)
CREATE POLICY "Users can view their own venda_servicos" 
ON public.venda_servicos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.vendas 
  WHERE vendas.id = venda_servicos.venda_id 
  AND vendas.user_id = auth.uid()
));

CREATE POLICY "Users can create their own venda_servicos" 
ON public.venda_servicos 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.vendas 
  WHERE vendas.id = venda_servicos.venda_id 
  AND vendas.user_id = auth.uid()
));

CREATE POLICY "Users can update their own venda_servicos" 
ON public.venda_servicos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.vendas 
  WHERE vendas.id = venda_servicos.venda_id 
  AND vendas.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own venda_servicos" 
ON public.venda_servicos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.vendas 
  WHERE vendas.id = venda_servicos.venda_id 
  AND vendas.user_id = auth.uid()
));

-- Adicionar campo forma_pagamento na tabela vendas
ALTER TABLE public.vendas 
ADD COLUMN forma_pagamento TEXT DEFAULT 'a_vista',
ADD COLUMN parcelas INTEGER DEFAULT 1;

-- Criar trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_servicos_updated_at
BEFORE UPDATE ON public.servicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();