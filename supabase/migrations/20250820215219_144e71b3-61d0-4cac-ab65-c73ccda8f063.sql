-- Create projetos table
CREATE TABLE public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3B82F6',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for projetos
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

-- Create policies for projetos
CREATE POLICY "Users can view their own projetos" 
ON public.projetos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projetos" 
ON public.projetos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projetos" 
ON public.projetos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projetos" 
ON public.projetos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create colunas_kanban table
CREATE TABLE public.colunas_kanban (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  projeto_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#6B7280',
  posicao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for colunas_kanban
ALTER TABLE public.colunas_kanban ENABLE ROW LEVEL SECURITY;

-- Create policies for colunas_kanban
CREATE POLICY "Users can view their own colunas_kanban" 
ON public.colunas_kanban 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own colunas_kanban" 
ON public.colunas_kanban 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own colunas_kanban" 
ON public.colunas_kanban 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own colunas_kanban" 
ON public.colunas_kanban 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create tarefas table
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  projeto_id UUID NOT NULL,
  coluna_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  responsavel_id UUID,
  posicao INTEGER NOT NULL DEFAULT 0,
  data_vencimento DATE,
  labels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tarefas
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Create policies for tarefas
CREATE POLICY "Users can view their own tarefas" 
ON public.tarefas 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = responsavel_id);

CREATE POLICY "Users can create their own tarefas" 
ON public.tarefas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tarefas" 
ON public.tarefas 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = responsavel_id);

CREATE POLICY "Users can delete their own tarefas" 
ON public.tarefas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comentarios_tarefa table
CREATE TABLE public.comentarios_tarefa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for comentarios_tarefa
ALTER TABLE public.comentarios_tarefa ENABLE ROW LEVEL SECURITY;

-- Create policies for comentarios_tarefa
CREATE POLICY "Users can view comentarios from their tarefas" 
ON public.comentarios_tarefa 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.tarefas 
  WHERE id = comentarios_tarefa.tarefa_id 
  AND (user_id = auth.uid() OR responsavel_id = auth.uid())
));

CREATE POLICY "Users can create comentarios" 
ON public.comentarios_tarefa 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_projetos_updated_at
BEFORE UPDATE ON public.projetos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at
BEFORE UPDATE ON public.tarefas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default columns for new projects function
CREATE OR REPLACE FUNCTION public.create_default_kanban_columns(projeto_id UUID, user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.colunas_kanban (user_id, projeto_id, nome, cor, posicao) VALUES
    (user_id, projeto_id, 'A Fazer', '#6B7280', 0),
    (user_id, projeto_id, 'Em Progresso', '#F59E0B', 1),
    (user_id, projeto_id, 'Em Revisão', '#8B5CF6', 2),
    (user_id, projeto_id, 'Concluído', '#10B981', 3);
END;
$$;