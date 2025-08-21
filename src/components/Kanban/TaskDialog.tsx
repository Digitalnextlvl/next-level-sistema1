import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, AlertCircle, Tag, FileText } from "lucide-react";
import { format } from "date-fns";
import { useKanbanTasks } from "@/hooks/useKanbanTasks";
import { Tarefa } from "@/hooks/useProjetos";
import { useToast } from "@/hooks/use-toast";

const tarefaSchema = z.object({
  titulo: z.string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título não pode ter mais de 100 caracteres"),
  descricao: z.string()
    .max(500, "Descrição não pode ter mais de 500 caracteres")
    .optional(),
  prioridade: z.enum(["baixa", "media", "alta"]).default("media"),
  responsavelIds: z.array(z.string()).optional(),
  data_vencimento: z.date().optional(),
  labels: z.string()
    .max(200, "Labels não podem ter mais de 200 caracteres")
    .optional(),
});

type TarefaFormData = z.infer<typeof tarefaSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  colunaId?: string;
  tarefa?: Tarefa;
}

export function TaskDialog({ open, onOpenChange, projetoId, colunaId, tarefa }: TaskDialogProps) {
  const { createTarefa, updateTarefa, usuarios, colunas } = useKanbanTasks(projetoId);
  const { toast } = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: tarefa?.titulo || "",
      descricao: tarefa?.descricao || "",
      prioridade: tarefa?.prioridade || "media",
      responsavelIds: tarefa?.responsaveis?.map(r => r.user_id) || [],
      data_vencimento: tarefa?.data_vencimento ? new Date(tarefa.data_vencimento) : undefined,
      labels: tarefa?.labels?.join(", ") || "",
    },
  });

  // Auto-focus on title field when dialog opens
  useEffect(() => {
    if (open && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset form when dialog closes or when tarefa changes
  useEffect(() => {
    console.log("TaskDialog - open:", open, "tarefa:", tarefa);
    
    if (!open) {
      form.reset({
        titulo: "",
        descricao: "",
        prioridade: "media",
        responsavel_id: "none",
        data_vencimento: undefined,
        labels: "",
      });
    } else if (tarefa) {
      // Populate form with existing task data when editing
      console.log("Populando form com dados da tarefa:", tarefa);
      form.reset({
        titulo: tarefa.titulo || "",
        descricao: tarefa.descricao || "",
        prioridade: tarefa.prioridade || "media",
        responsavel_id: tarefa.responsavel_id || "none",
        data_vencimento: tarefa.data_vencimento ? new Date(tarefa.data_vencimento) : undefined,
        labels: tarefa.labels?.join(", ") || "",
      });
    } else {
      // Reset for new task
      form.reset({
        titulo: "",
        descricao: "",
        prioridade: "media",
        responsavel_id: "none",
        data_vencimento: undefined,
        labels: "",
      });
    }
  }, [open, form, tarefa]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, form]);

  const onSubmit = async (data: TarefaFormData) => {
    try {
      const tarefaData = {
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        projeto_id: projetoId,
        coluna_id: colunaId || tarefa?.coluna_id || "",
        data_vencimento: data.data_vencimento?.toISOString().split('T')[0],
        responsavel_id: data.responsavel_id === "none" ? null : data.responsavel_id,
        labels: data.labels ? data.labels.split(",").map(label => label.trim()).filter(Boolean) : [],
      };

      if (tarefa) {
        await updateTarefa.mutateAsync({ id: tarefa.id, ...tarefaData });
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        await createTarefa.mutateAsync(tarefaData);
        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso.",
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar tarefa",
        description: "Ocorreu um erro ao salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tarefa ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {tarefa ? "Edite os detalhes da tarefa" : "Preencha os dados da nova tarefa"}
            <span className="block mt-1 text-xs">Dica: Use Ctrl+Enter para salvar rapidamente</span>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Título da Tarefa <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      ref={titleInputRef}
                      placeholder="Ex: Implementar funcionalidade X" 
                      {...field} 
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/100
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes da tarefa..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Prioridade
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">🟢 Baixa</SelectItem>
                        <SelectItem value="media">🟡 Média</SelectItem>
                        <SelectItem value="alta">🔴 Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Responsável
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem responsável</SelectItem>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.user_id} value={usuario.user_id}>
                            {usuario.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="data_vencimento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data de Vencimento
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="labels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Labels
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: frontend, urgente, bug (separados por vírgula)"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/200
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createTarefa.isPending || updateTarefa.isPending}
              >
                {createTarefa.isPending || updateTarefa.isPending
                  ? "Salvando..." 
                  : tarefa ? "Atualizar" : "Criar Tarefa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}