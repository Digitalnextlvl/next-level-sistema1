-- Create table for multiple task assignees
CREATE TABLE public.tarefa_responsaveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tarefa_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tarefa_responsaveis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "All authenticated users can view tarefa_responsaveis" 
ON public.tarefa_responsaveis 
FOR SELECT 
USING (true);

CREATE POLICY "All authenticated users can create tarefa_responsaveis" 
ON public.tarefa_responsaveis 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "All authenticated users can update tarefa_responsaveis" 
ON public.tarefa_responsaveis 
FOR UPDATE 
USING (true);

CREATE POLICY "All authenticated users can delete tarefa_responsaveis" 
ON public.tarefa_responsaveis 
FOR DELETE 
USING (true);

-- Create trigger for timestamps
CREATE TRIGGER update_tarefa_responsaveis_updated_at
BEFORE UPDATE ON public.tarefa_responsaveis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data from responsavel_id to new table
INSERT INTO public.tarefa_responsaveis (tarefa_id, user_id)
SELECT id, responsavel_id 
FROM public.tarefas 
WHERE responsavel_id IS NOT NULL;

-- Remove the old responsavel_id column
ALTER TABLE public.tarefas DROP COLUMN responsavel_id;