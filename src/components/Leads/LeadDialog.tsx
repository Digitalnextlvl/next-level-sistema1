import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLead, useUpdateLead, type Lead, type CreateLeadData } from "@/hooks/useLeads";
import { Plus, Edit } from "lucide-react";

interface LeadDialogProps {
  lead?: Lead;
  mode?: 'create' | 'edit';
  trigger?: React.ReactNode;
}

export function LeadDialog({ lead, mode = 'create', trigger }: LeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateLeadData & { status?: string }>({
    nome: lead?.nome || '',
    email: lead?.email || '',
    telefone: lead?.telefone || '',
    empresa: lead?.empresa || '',
    cargo: lead?.cargo || '',
    origem: lead?.origem || 'website',
    temperatura: lead?.temperatura || 'frio',
    valor_estimado: lead?.valor_estimado || undefined,
    observacoes: lead?.observacoes || '',
    proxima_acao: lead?.proxima_acao || '',
    data_proxima_acao: lead?.data_proxima_acao || '',
    status: lead?.status || 'novo',
  });

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'edit' && lead) {
        await updateLead.mutateAsync({ id: lead.id, data: formData });
      } else {
        await createLead.mutateAsync(formData);
      }
      setOpen(false);
      if (mode === 'create') {
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          empresa: '',
          cargo: '',
          origem: 'website',
          temperatura: 'frio',
          valor_estimado: undefined,
          observacoes: '',
          proxima_acao: '',
          data_proxima_acao: '',
        });
      }
    } catch (error) {
      // Error already handled by mutation hooks
    }
  };

  const defaultTrigger = (
    <Button>
      {mode === 'create' ? (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </>
      ) : (
        <>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Lead' : 'Editar Lead'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="origem">Origem</Label>
              <Select 
                value={formData.origem} 
                onValueChange={(value) => setFormData({ ...formData, origem: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="temperatura">Temperatura</Label>
              <Select 
                value={formData.temperatura} 
                onValueChange={(value) => setFormData({ ...formData, temperatura: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frio">🔵 Frio</SelectItem>
                  <SelectItem value="morno">🟡 Morno</SelectItem>
                  <SelectItem value="quente">🔴 Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === 'edit' && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="contato">Em Contato</SelectItem>
                    <SelectItem value="qualificado">Qualificado</SelectItem>
                    <SelectItem value="proposta">Proposta Enviada</SelectItem>
                    <SelectItem value="negociacao">Negociação</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="valor_estimado">Valor Estimado</Label>
              <Input
                id="valor_estimado"
                type="number"
                step="0.01"
                value={formData.valor_estimado || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  valor_estimado: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proxima_acao">Próxima Ação</Label>
              <Input
                id="proxima_acao"
                value={formData.proxima_acao}
                onChange={(e) => setFormData({ ...formData, proxima_acao: e.target.value })}
                placeholder="Ex: Enviar proposta comercial"
              />
            </div>
            <div>
              <Label htmlFor="data_proxima_acao">Data da Próxima Ação</Label>
              <Input
                id="data_proxima_acao"
                type="date"
                value={formData.data_proxima_acao}
                onChange={(e) => setFormData({ ...formData, data_proxima_acao: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createLead.isPending || updateLead.isPending}
            >
              {createLead.isPending || updateLead.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}