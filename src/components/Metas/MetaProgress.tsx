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
  
  const formatCompact = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${Math.round(value / 1000)}K`;
  };

  const percentage = Math.min(progresso.percentual_faturamento, 100);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer">
            {/* Ícone da meta */}
            <Target className="h-4 w-4 text-green-600 hidden sm:block" />
            
            {/* Barra de progresso horizontal */}
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-6 w-32 sm:w-40 overflow-hidden">
              {/* Barra de progresso preenchida */}
              <div 
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${percentage}%` }}
              />
              
              {/* Texto sobre a barra */}
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                R$ {formatCompact(progresso.faturamento_atual)} / R$ {formatCompact(Number(progresso.meta.meta_faturamento))}
              </div>
            </div>
            
            {/* Percentual */}
            <span className="text-sm font-medium text-green-600 hidden sm:block">
              {progresso.percentual_faturamento.toFixed(0)}%
            </span>
          </div>
        </TooltipTrigger>
        
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">Meta de Faturamento</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Progress value={progresso.percentual_faturamento} className="w-24 h-2" />
                <span className="text-xs font-medium">
                  {progresso.percentual_faturamento.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
              <div>Vendas: {progresso.vendas_atual}/{progresso.meta.meta_vendas}</div>
              <div>Clientes: {progresso.clientes_atual}/{progresso.meta.meta_novos_clientes}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}