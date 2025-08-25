import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vendedor {
  id: string;
  user_id: string;
  name: string;
  role: string;
}

interface UseVendedoresOptions {
  currentUserOnly?: boolean;
}

export function useVendedores(options: UseVendedoresOptions = {}) {
  return useQuery({
    queryKey: ['vendedores', options],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('profiles')
        .select('id, user_id, name, role')
        .in('role', ['vendedor', 'admin'])
        .order('name');

      // If currentUserOnly is true, filter to only the current user
      if (options.currentUserOnly && user) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Vendedor[];
    },
  });
}