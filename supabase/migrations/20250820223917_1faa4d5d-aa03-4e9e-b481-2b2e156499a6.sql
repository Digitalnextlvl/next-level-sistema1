-- Remove the old policy that restricts users to see only their own projects
DROP POLICY IF EXISTS "Users can view their own projetos" ON public.projetos;

-- Create new policy that allows all authenticated users to view all projects
CREATE POLICY "All authenticated users can view projetos" 
ON public.projetos 
FOR SELECT 
TO authenticated
USING (true);

-- Keep other policies unchanged for create, update, delete (users can only manage their own projects)
-- This ensures users can see all projects but can only modify the ones they created