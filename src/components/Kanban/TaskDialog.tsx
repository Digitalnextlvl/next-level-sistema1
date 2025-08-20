import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useKanbanTasks } from "@/hooks/useKanbanTasks";
import { Tarefa } from "@/hooks/useProjetos";

const tarefaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  prioridade: z.enum(["baixa", "media", "alta"]).default("media"),
  responsavel_id: z.string().optional(),
  data_vencimento: z.date().optional(),
  labels: z.string().optional(),
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

  const form = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: tarefa?.titulo || "",
      descricao: tarefa?.descricao || "",
      prioridade: tarefa?.prioridade || "media",
      responsavel_id: tarefa?.responsavel_id || "",
      data_vencimento: tarefa?.data_vencimento ? new Date(tarefa.data_vencimento) : undefined,
      labels: tarefa?.labels?.join(", ") || "",
    },
  });

  const onSubmit = async (data: TarefaFormData) => {
    try {
      const tarefaData = {
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        projeto_id: projetoId,
        coluna_id: colunaId || tarefa?.coluna_id || "",
        data_vencimento: data.data_vencimento?.toISOString().split('T')[0],
        responsavel_id: data.responsavel_id || null,
        labels: data.labels ? data.labels.split(",").map(label => label.trim()).filter(Boolean) : [],
      };

      if (tarefa) {
        await updateTarefa.mutateAsync({ id: tarefa.id, ...tarefaData });
      } else {
        await createTarefa.mutateAsync(tarefaData);
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tarefa ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Tarefa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Implementar funcionalidade X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes da tarefa..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
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
                    <FormLabel>Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sem responsável</SelectItem>
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
                  <FormLabel>Data de Vencimento</FormLabel>
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
                  <FormLabel>Labels</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: frontend, urgente, bug (separados por vírgula)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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