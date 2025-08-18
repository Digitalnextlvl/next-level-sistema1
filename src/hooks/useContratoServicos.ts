import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interfaces
interface ContratoServico {
  id: string;
  contrato_id: string;
  servico_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
  servico?: {
    id: string;
    nome: string;
    descricao?: string;
    valor: number;
    categoria?: string;
    nivel_complexidade?: string;
  };
}

interface CreateContratoServicoData {
  contrato_id: string;
  servico_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

// Hook para buscar serviços de um contrato
export function useContratoServicos(contratoId: string) {
  return useQuery({
    queryKey: ["contrato-servicos", contratoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contrato_servicos")
        .select(`
          *,
          servico:servicos(*)
        `)
        .eq("contrato_id", contratoId);

      if (error) throw error;
      return data as ContratoServico[];
    },
    enabled: !!contratoId,
  });
}

// Hook para criar contrato_servico
export function useCreateContratoServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContratoServicoData) => {
      const { data: contratoServico, error } = await supabase
        .from("contrato_servicos")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return contratoServico;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contrato-servicos", variables.contrato_id] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
    },
    onError: (error) => {
      toast.error("Erro ao adicionar serviço ao contrato. Tente novamente.");
    },
  });
}

// Hook para deletar contrato_servico
export function useDeleteContratoServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoServicoId: string) => {
      const { error } = await supabase
        .from("contrato_servicos")
        .delete()
        .eq("id", contratoServicoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contrato-servicos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
    },
    onError: (error) => {
      toast.error("Erro ao remover serviço do contrato. Tente novamente.");
    },
  });
}

// Hook para atualizar múltiplos serviços de um contrato
export function useUpdateContratoServicos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contratoId, servicos }: { 
      contratoId: string; 
      servicos: CreateContratoServicoData[] 
    }) => {
      // Primeiro, deletar todos os serviços existentes do contrato
      const { error: deleteError } = await supabase
        .from("contrato_servicos")
        .delete()
        .eq("contrato_id", contratoId);

      if (deleteError) throw deleteError;

      // Depois, inserir os novos serviços
      if (servicos.length > 0) {
        const { data, error: insertError } = await supabase
          .from("contrato_servicos")
          .insert(servicos)
          .select();

        if (insertError) throw insertError;
        return data;
      }

      return [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contrato-servicos", variables.contratoId] });
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar serviços do contrato. Tente novamente.");
    },
  });
}