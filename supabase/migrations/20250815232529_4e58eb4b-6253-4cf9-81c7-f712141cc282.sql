-- Criar sistema de comissões e leads para agência de IA

-- Atualizar profiles com campos para vendedores
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS percentual_comissao DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS meta_mensal DECIMAL(12,2) DEFAULT 10000.00,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT;

-- Tabela de leads e pipeline
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendedor_id UUID,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  cargo TEXT,
  origem TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'novo',
  temperatura TEXT DEFAULT 'frio',
  valor_estimado DECIMAL(12,2),
  observacoes TEXT,
  data_contato DATE DEFAULT CURRENT_DATE,
  proxima_acao TEXT,
  data_proxima_acao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de comissões
CREATE TABLE public.comissoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendedor_id UUID NOT NULL,
  venda_id UUID NOT NULL,
  valor_venda DECIMAL(12,2) NOT NULL,
  percentual DECIMAL(5,2) NOT NULL,
  valor_comissao DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_pagamento DATE,
  mes_referencia DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de metas mensais
CREATE TABLE public.metas_vendedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendedor_id UUID NOT NULL,
  mes_ano DATE NOT NULL,
  meta_vendas DECIMAL(12,2) NOT NULL,
  meta_clientes INTEGER DEFAULT 5,
  bonus_meta DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vendedor_id, mes_ano)
);

-- Tabela de atividades (histórico de interações)
CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendedor_id UUID NOT NULL,
  lead_id UUID,
  cliente_id UUID,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_atividade TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'concluida',
  resultado TEXT,
  proxima_acao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expandir serviços com categorias para agência de IA
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'agente_ia',
ADD COLUMN IF NOT EXISTS tipo_cobranca TEXT DEFAULT 'fixo',
ADD COLUMN IF NOT EXISTS tempo_entrega_dias INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS nivel_complexidade TEXT DEFAULT 'medio';

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- RLS Policies para leads
CREATE POLICY "Users can view their own leads" 
ON public.leads FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = vendedor_id);

CREATE POLICY "Users can create their own leads" 
ON public.leads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
ON public.leads FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = vendedor_id);

CREATE POLICY "Users can delete their own leads" 
ON public.leads FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies para comissões
CREATE POLICY "Users can view their own comissoes" 
ON public.comissoes FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = vendedor_id);

CREATE POLICY "Users can create their own comissoes" 
ON public.comissoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comissoes" 
ON public.comissoes FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies para metas
CREATE POLICY "Users can view their own metas" 
ON public.metas_vendedores FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = vendedor_id);

CREATE POLICY "Users can create their own metas" 
ON public.metas_vendedores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metas" 
ON public.metas_vendedores FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies para atividades
CREATE POLICY "Users can view their own atividades" 
ON public.atividades FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = vendedor_id);

CREATE POLICY "Users can create their own atividades" 
ON public.atividades FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() = vendedor_id);

CREATE POLICY "Users can update their own atividades" 
ON public.atividades FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = vendedor_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comissoes_updated_at
  BEFORE UPDATE ON public.comissoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
  BEFORE UPDATE ON public.metas_vendedores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão de serviços para agência de IA
INSERT INTO public.servicos (user_id, nome, descricao, valor, categoria, tipo_cobranca, tempo_entrega_dias, nivel_complexidade) VALUES
('00000000-0000-0000-0000-000000000000', 'Agente de IA Simples', 'Chatbot básico para atendimento ao cliente', 2500.00, 'agente_ia', 'fixo', 15, 'simples'),
('00000000-0000-0000-0000-000000000000', 'Agente de IA Avançado', 'IA conversacional com integração a sistemas', 8500.00, 'agente_ia', 'fixo', 30, 'complexo'),
('00000000-0000-0000-0000-000000000000', 'Automação RPA', 'Automação de processos repetitivos', 4200.00, 'automacao', 'fixo', 20, 'medio'),
('00000000-0000-0000-0000-000000000000', 'Integração APIs', 'Conectar sistemas via APIs personalizadas', 3500.00, 'integracao', 'por_hora', 10, 'medio'),
('00000000-0000-0000-0000-000000000000', 'Consultoria em IA', 'Análise e recomendações estratégicas', 1500.00, 'consultoria', 'por_hora', 5, 'simples'),
('00000000-0000-0000-0000-000000000000', 'Treinamento de Modelo', 'IA personalizada com dados do cliente', 12000.00, 'modelo_ia', 'fixo', 45, 'complexo')
ON CONFLICT DO NOTHING;