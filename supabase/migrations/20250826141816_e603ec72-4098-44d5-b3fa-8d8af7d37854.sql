-- Update RLS policies for servicos table to make them shared among all users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own servicos" ON public.servicos;
DROP POLICY IF EXISTS "Users can create their own servicos" ON public.servicos;
DROP POLICY IF EXISTS "Users can update their own servicos" ON public.servicos;
DROP POLICY IF EXISTS "Users can delete their own servicos" ON public.servicos;

-- Create new policies for shared services
-- All authenticated users can view all active services
CREATE POLICY "All users can view active servicos" 
ON public.servicos 
FOR SELECT 
TO authenticated
USING (ativo = true);

-- All authenticated users can create services
CREATE POLICY "All users can create servicos" 
ON public.servicos 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only service creators can update their own services
CREATE POLICY "Users can update their own servicos" 
ON public.servicos 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Only service creators can delete their own services
CREATE POLICY "Users can delete their own servicos" 
ON public.servicos 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);