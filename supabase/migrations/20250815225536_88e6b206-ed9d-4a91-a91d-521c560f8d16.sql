-- Criar tabela de categorias financeiras
CREATE TABLE public.categorias_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor TEXT NOT NULL DEFAULT '#3B82F6',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE public.transacoes_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria_id UUID REFERENCES public.categorias_financeiras(id),
  valor NUMERIC NOT NULL CHECK (valor > 0),
  descricao TEXT,
  data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
  venda_id UUID REFERENCES public.vendas(id),
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para categorias_financeiras
CREATE POLICY "Users can view their own categorias_financeiras" 
ON public.categorias_financeiras 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categorias_financeiras" 
ON public.categorias_financeiras 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categorias_financeiras" 
ON public.categorias_financeiras 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categorias_financeiras" 
ON public.categorias_financeiras 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para transacoes_financeiras
CREATE POLICY "Users can view their own transacoes_financeiras" 
ON public.transacoes_financeiras 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transacoes_financeiras" 
ON public.transacoes_financeiras 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transacoes_financeiras" 
ON public.transacoes_financeiras 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transacoes_financeiras" 
ON public.transacoes_financeiras 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar triggers para updated_at
CREATE TRIGGER update_categorias_financeiras_updated_at
BEFORE UPDATE ON public.categorias_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transacoes_financeiras_updated_at
BEFORE UPDATE ON public.transacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão (serão criadas apenas quando o usuário fizer login)
-- As categorias padrão serão criadas via código para garantir que cada usuário tenha as suas próprias