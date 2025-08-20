-- Fix the function search path
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