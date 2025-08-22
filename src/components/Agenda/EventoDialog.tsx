import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Clock, MapPin, Palette, Plus, Edit2 } from "lucide-react";
import { EventoUnificado } from "@/hooks/useAgendaUnificada";
import { toast } from "sonner";

const eventoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  data_inicio: z.string().min(1, "Data de início é obrigatória"),
  data_fim: z.string().min(1, "Data de fim é obrigatória"),
  local: z.string().optional(),
  cor: z.string().default("#3B82F6"),
});

type EventoFormData = z.infer<typeof eventoSchema>;

interface EventoDialogProps {
  evento?: EventoUnificado;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave: (data: EventoFormData, syncToGoogle: boolean) => Promise<void>;
  children?: React.ReactNode;
}

const cores = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Amarelo", value: "#F59E0B" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Cinza", value: "#6B7280" },
];

export function EventoDialog({ evento, isOpen, onOpenChange, onSave, children }: EventoDialogProps) {
  const [open, setOpen] = useState(false);
  const [syncToGoogle, setSyncToGoogle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      data_inicio: "",
      data_fim: "",
      local: "",
      cor: "#3B82F6",
    },
  });

  // Update form when editing an existing event
  useEffect(() => {
    if (evento) {
      const dataInicio = new Date(evento.data_inicio);
      const dataFim = new Date(evento.data_fim);
      
      form.reset({
        titulo: evento.titulo,
        descricao: evento.descricao || "",
        data_inicio: `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}-${String(dataInicio.getDate()).padStart(2, '0')}T${String(dataInicio.getHours()).padStart(2, '0')}:${String(dataInicio.getMinutes()).padStart(2, '0')}`,
        data_fim: `${dataFim.getFullYear()}-${String(dataFim.getMonth() + 1).padStart(2, '0')}-${String(dataFim.getDate()).padStart(2, '0')}T${String(dataFim.getHours()).padStart(2, '0')}:${String(dataFim.getMinutes()).padStart(2, '0')}`,
        local: evento.local || "",
        cor: evento.cor,
      });
    } else {
      form.reset({
        titulo: "",
        descricao: "",
        data_inicio: "",
        data_fim: "",
        local: "",
        cor: "#3B82F6",
      });
    }
  }, [evento, form]);

  // Handle controlled open state
  useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      form.reset();
      setSyncToGoogle(false);
    }
  };

  const onSubmit = async (data: EventoFormData) => {
    try {
      setIsLoading(true);

      // Validate dates
      const startDate = new Date(data.data_inicio);
      const endDate = new Date(data.data_fim);
      
      if (startDate >= endDate) {
        toast.error("A data de fim deve ser posterior à data de início");
        return;
      }

      // Convert to ISO strings
      const formattedData = {
        ...data,
        data_inicio: startDate.toISOString(),
        data_fim: endDate.toISOString(),
      };

      await onSave(formattedData, syncToGoogle);
      handleOpenChange(false);
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isGoogleEvent = evento?.tipo === 'google';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {evento ? (
              <>
                <Edit2 className="w-5 h-5" />
                Editar Evento
              </>
            ) : (
              <>
                <CalendarDays className="w-5 h-5" />
                Novo Evento
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {evento 
              ? "Edite as informações do evento selecionado." 
              : "Preencha as informações para criar um novo evento."
            }
          </DialogDescription>
        </DialogHeader>

        {isGoogleEvent && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Este é um evento do Google Calendar. Para editá-lo, use o Google Calendar diretamente.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Digite o título do evento"
                      disabled={isGoogleEvent}
                    />
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
                      {...field}
                      placeholder="Adicione uma descrição (opcional)"
                      rows={3}
                      disabled={isGoogleEvent}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Data e Hora de Início *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        disabled={isGoogleEvent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Data e Hora de Fim *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        disabled={isGoogleEvent}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="local"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Local
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Adicione o local do evento (opcional)"
                      disabled={isGoogleEvent}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor
                  </FormLabel>
                  <FormControl>
                     <div className="flex gap-3 flex-wrap">
                       {cores.map((cor) => (
                         <button
                           key={cor.value}
                           type="button"
                           className={`w-10 h-10 rounded-full border-3 transition-all relative ${
                             field.value === cor.value
                               ? "border-primary ring-2 ring-primary/20 scale-110"
                               : "border-border hover:scale-105"
                           }`}
                           style={{ backgroundColor: cor.value }}
                           onClick={() => !isGoogleEvent && field.onChange(cor.value)}
                           title={cor.name}
                           disabled={isGoogleEvent}
                         >
                           {field.value === cor.value && (
                             <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-3 h-3 bg-white rounded-full" />
                             </div>
                           )}
                         </button>
                       ))}
                     </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!evento && (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium">Sincronizar com Google Calendar</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Criar este evento também no seu Google Calendar
                  </p>
                </div>
                <Switch
                  checked={syncToGoogle}
                  onCheckedChange={setSyncToGoogle}
                />
              </div>
            )}

            {!isGoogleEvent && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : evento ? "Atualizar" : "Criar Evento"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}