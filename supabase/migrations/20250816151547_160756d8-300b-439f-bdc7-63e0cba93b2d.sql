-- Create function to get current user role (if not exists)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies that allow admins to manage all profiles
CREATE POLICY "Users can view profiles based on role" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Users can update profiles based on role" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  get_current_user_role() = 'admin'
);