import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CandidaturaData {
  nome: string;
  email: string;
  telefone: string;
  sobre_voce: string;
  objetivo_vendas: string;
}

export function useCandidaturas() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createCandidatura = async (data: CandidaturaData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('candidaturas')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Candidatura enviada!",
        description: "Recebemos sua candidatura. Entraremos em contato em breve!",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar candidatura:', error);
      toast({
        title: "Erro ao enviar candidatura",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCandidatura,
    isLoading,
  };
}