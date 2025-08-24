-- Drop existing problematic policies for clientes table
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clientes;

-- Create new policies that allow admins to delete/update any client
CREATE POLICY "Users can delete clients based on role" 
ON public.clientes 
FOR DELETE 
USING ((get_current_user_role() = 'admin'::text) OR (auth.uid() = user_id));

CREATE POLICY "Users can update clients based on role" 
ON public.clientes 
FOR UPDATE 
USING ((get_current_user_role() = 'admin'::text) OR (auth.uid() = user_id));