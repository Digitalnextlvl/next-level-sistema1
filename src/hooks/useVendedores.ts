import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vendedor {
  id: string;
  user_id: string;
  name: string;
  role: string;
}

export function useVendedores() {
  return useQuery({
    queryKey: ['vendedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, role')
        .eq('role', 'vendedor')
        .order('name');
      
      if (error) throw error;
      return data as Vendedor[];
    },
  });
}