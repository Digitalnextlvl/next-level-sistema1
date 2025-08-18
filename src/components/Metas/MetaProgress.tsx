import { Progress } from "@/components/ui/progress";
import { useMetaAtual } from "@/hooks/useMetas";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Target } from "lucide-react";
export function MetaProgress() {
  const {
    data: progresso
  } = useMetaAtual();
  if (!progresso) return null;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const formatCompact = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    if (value === 0) {
      return "R$ 0";
    }
    return formatCurrency(value);
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-primary';
  };
  return <TooltipProvider>
      <div className="flex items-center gap-1 px-2 py-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 border rounded-md text-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="font-medium">Meta:</span>
              <span className="font-medium">
                {progresso.percentual_faturamento.toFixed(0)}%
              </span>
              <span className="font-medium">
                {formatCompact(progresso.faturamento_atual)}
              </span>
              <span className="text-muted-foreground">
                / {formatCompact(Number(progresso.meta.meta_faturamento))}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <p className="font-medium">Meta de Faturamento</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Progress value={progresso.percentual_faturamento} className="w-24 h-2" />
                  <span className="text-xs font-medium">
                    {progresso.percentual_faturamento.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm">{formatCurrency(progresso.faturamento_atual)} / {formatCurrency(Number(progresso.meta.meta_faturamento))}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                <div>Vendas: {progresso.vendas_atual}/{progresso.meta.meta_vendas}</div>
                <div>Clientes: {progresso.clientes_atual}/{progresso.meta.meta_novos_clientes}</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {progresso.percentual_faturamento >= 100 && (
          <Badge variant="default" className="bg-green-500 text-white text-xs ml-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Meta Atingida!
          </Badge>
        )}
      </div>
    </TooltipProvider>;
}