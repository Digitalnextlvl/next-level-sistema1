-- Adicionar campo status na tabela tarefas
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);

-- Atualizar tarefas existentes com status baseado na posição/coluna
UPDATE public.tarefas 
SET status = 'pendente' 
WHERE status IS NULL;