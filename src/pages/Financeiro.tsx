import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  CalendarIcon,
  Plus,
  Settings,
  RefreshCw
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  useResumoFinanceiro, 
  useTransacoesMes, 
  useCategorias,
  useSincronizarVendas 
} from "@/hooks/useFinanceiro";
import { TransacaoDialog } from "@/components/Financeiro/TransacaoDialog";
import { CategoriaDialog } from "@/components/Financeiro/CategoriaDialog";
import { MonthYearPicker } from "@/components/Financeiro/MonthYearPicker";

export default function Financeiro() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: resumo, isLoading: isLoadingResumo } = useResumoFinanceiro(selectedDate);
  const { data: transacoes, isLoading: isLoadingTransacoes } = useTransacoesMes(selectedDate);
  const { data: categorias } = useCategorias();
  const sincronizarVendas = useSincronizarVendas();

  const handlePreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1));
  };

  const handleCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Agrupar transações por categoria
  const receitasPorCategoria = transacoes
    ?.filter(t => t.tipo === 'receita')
    .reduce((acc, transacao) => {
      const categoria = transacao.categoria?.nome || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + Number(transacao.valor);
      return acc;
    }, {} as Record<string, number>) || {};

  const despesasPorCategoria = transacoes
    ?.filter(t => t.tipo === 'despesa')
    .reduce((acc, transacao) => {
      const categoria = transacao.categoria?.nome || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + Number(transacao.valor);
      return acc;
    }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Header com controles de data */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle financeiro mensal e análise de resultados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            ←
          </Button>
          
          <MonthYearPicker 
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
          
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            →
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleCurrentMonth}>
            Hoje
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Mensal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingResumo ? "..." : formatCurrency(resumo?.receita_total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoadingResumo ? "..." : formatCurrency(resumo?.despesa_total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              (resumo?.lucro_liquido || 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {isLoadingResumo ? "..." : formatCurrency(resumo?.lucro_liquido || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              (resumo?.margem_lucro || 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {isLoadingResumo ? "..." : formatPercentage(resumo?.margem_lucro || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Ferramentas financeiras mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <TransacaoDialog tipo="receita">
              <Button variant="outline" className="h-20 flex-col">
                <DollarSign className="h-6 w-6 mb-2 text-green-600" />
                Lançar Receita
              </Button>
            </TransacaoDialog>
            
            <TransacaoDialog tipo="despesa">
              <Button variant="outline" className="h-20 flex-col">
                <TrendingDown className="h-6 w-6 mb-2 text-red-600" />
                Registrar Despesa
              </Button>
            </TransacaoDialog>
            
            <CategoriaDialog>
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                Gerenciar Categorias
              </Button>
            </CategoriaDialog>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => sincronizarVendas.mutate()}
              disabled={sincronizarVendas.isPending}
            >
              <RefreshCw className={cn(
                "h-6 w-6 mb-2",
                sincronizarVendas.isPending && "animate-spin"
              )} />
              Sincronizar Vendas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seções Financeiras */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
            <CardDescription>
              Distribuição de receitas no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransacoes ? (
              <div className="text-center text-muted-foreground">Carregando...</div>
            ) : Object.keys(receitasPorCategoria).length === 0 ? (
              <div className="text-center text-muted-foreground">
                Nenhuma receita encontrada no período
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(receitasPorCategoria).map(([categoria, valor]) => (
                  <div key={categoria} className="flex items-center justify-between">
                    <span className="text-sm">{categoria}</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Controle de gastos no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransacoes ? (
              <div className="text-center text-muted-foreground">Carregando...</div>
            ) : Object.keys(despesasPorCategoria).length === 0 ? (
              <div className="text-center text-muted-foreground">
                Nenhuma despesa encontrada no período
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(despesasPorCategoria).map(([categoria, valor]) => (
                  <div key={categoria} className="flex items-center justify-between">
                    <span className="text-sm">{categoria}</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações do Período</CardTitle>
          <CardDescription>
            Últimas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransacoes ? (
            <div className="text-center text-muted-foreground">Carregando...</div>
          ) : !transacoes || transacoes.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Nenhuma transação encontrada no período
            </div>
          ) : (
            <div className="space-y-3">
              {transacoes.slice(0, 10).map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      transacao.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <div>
                      <div className="font-medium">
                        {transacao.descricao || `${transacao.tipo === 'receita' ? 'Receita' : 'Despesa'} sem descrição`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transacao.categoria?.nome || 'Sem categoria'} • {format(new Date(transacao.data_transacao), "dd/MM/yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-medium",
                    transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Number(transacao.valor))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}