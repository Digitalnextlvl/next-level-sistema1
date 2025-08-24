import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Projeto {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  cor: string;
  ativo: boolean;
  privado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColunaKanban {
  id: string;
  user_id: string;
  projeto_id: string;
  nome: string;
  cor: string;
  posicao: number;
  created_at: string;
}

export interface Tarefa {
  id: string;
  user_id: string;
  projeto_id: string;
  coluna_id: string;
  titulo: string;
  descricao?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  posicao: number;
  data_vencimento?: string;
  labels?: string[];
  created_at: string;
  updated_at: string;
  responsaveis?: Array<{
    user_id: string;
    name: string;
    avatar_url?: string;
  }>;
}

export const useProjetos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projetos = [], isLoading } = useQuery({
    queryKey: ["projetos"],
    queryFn: async () => {
      // Get user role to determine project visibility
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user?.id)
        .single();

      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Filter projects based on user role
      const filteredData = data.filter((projeto: Projeto) => {
        if (profile?.role === 'admin') {
          return true; // Admins see all projects
        }
        return !projeto.privado; // Others only see public projects
      });

      return filteredData as Projeto[];
    },
    enabled: !!user,
  });

  const createProjeto = useMutation({
    mutationFn: async (projeto: Omit<Projeto, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("projetos")
        .insert({
          ...projeto,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create default columns for the new project
      const { error: columnsError } = await supabase.rpc('create_default_kanban_columns', {
        projeto_id: data.id,
        user_id: user?.id
      });

      if (columnsError) throw columnsError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Projeto criado",
        description: "O projeto foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar projeto",
        description: "Não foi possível criar o projeto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateProjeto = useMutation({
    mutationFn: async ({ id, ...projeto }: Partial<Projeto> & { id: string }) => {
      const { data, error } = await supabase
        .from("projetos")
        .update(projeto)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Projeto atualizado",
        description: "O projeto foi atualizado com sucesso.",
      });
    },
  });

  const deleteProjeto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projetos")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projetos"] });
      toast({
        title: "Projeto excluído",
        description: "O projeto foi excluído com sucesso.",
      });
    },
  });

  return {
    projetos,
    isLoading,
    createProjeto,
    updateProjeto,
    deleteProjeto,
  };
};