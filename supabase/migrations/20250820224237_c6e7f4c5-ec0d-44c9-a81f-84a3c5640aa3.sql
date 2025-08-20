-- Update projetos policies to allow all operations for all authenticated users
DROP POLICY IF EXISTS "Users can create their own projetos" ON public.projetos;
DROP POLICY IF EXISTS "Users can update their own projetos" ON public.projetos;
DROP POLICY IF EXISTS "Users can delete their own projetos" ON public.projetos;

CREATE POLICY "All authenticated users can create projetos" 
ON public.projetos 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "All authenticated users can update projetos" 
ON public.projetos 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can delete projetos" 
ON public.projetos 
FOR DELETE 
TO authenticated
USING (true);

-- Update colunas_kanban policies to allow all operations for all authenticated users
DROP POLICY IF EXISTS "Users can view their own colunas_kanban" ON public.colunas_kanban;
DROP POLICY IF EXISTS "Users can create their own colunas_kanban" ON public.colunas_kanban;
DROP POLICY IF EXISTS "Users can update their own colunas_kanban" ON public.colunas_kanban;
DROP POLICY IF EXISTS "Users can delete their own colunas_kanban" ON public.colunas_kanban;

CREATE POLICY "All authenticated users can view colunas_kanban" 
ON public.colunas_kanban 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can create colunas_kanban" 
ON public.colunas_kanban 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "All authenticated users can update colunas_kanban" 
ON public.colunas_kanban 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can delete colunas_kanban" 
ON public.colunas_kanban 
FOR DELETE 
TO authenticated
USING (true);

-- Update tarefas policies to allow all operations for all authenticated users
DROP POLICY IF EXISTS "Users can view their own tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Users can create their own tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Users can update their own tarefas" ON public.tarefas;
DROP POLICY IF EXISTS "Users can delete their own tarefas" ON public.tarefas;

CREATE POLICY "All authenticated users can view tarefas" 
ON public.tarefas 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can create tarefas" 
ON public.tarefas 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "All authenticated users can update tarefas" 
ON public.tarefas 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can delete tarefas" 
ON public.tarefas 
FOR DELETE 
TO authenticated
USING (true);

-- Update comentarios_tarefa policies to allow all operations for all authenticated users
DROP POLICY IF EXISTS "Users can view comentarios from their tarefas" ON public.comentarios_tarefa;
DROP POLICY IF EXISTS "Users can create comentarios" ON public.comentarios_tarefa;

CREATE POLICY "All authenticated users can view comentarios_tarefa" 
ON public.comentarios_tarefa 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can create comentarios_tarefa" 
ON public.comentarios_tarefa 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "All authenticated users can update comentarios_tarefa" 
ON public.comentarios_tarefa 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can delete comentarios_tarefa" 
ON public.comentarios_tarefa 
FOR DELETE 
TO authenticated
USING (true);