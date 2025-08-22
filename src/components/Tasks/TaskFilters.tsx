import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface TaskFilters {
  search: string;
  status: string[];
  priority: string[];
  sortBy: 'date' | 'priority' | 'project' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  projects: Array<{ id: string; nome: string }>;
}

export function TaskFilters({ filters, onFiltersChange, projects }: TaskFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = [
    { value: 'A Fazer', label: 'A Fazer' },
    { value: 'Em Progresso', label: 'Em Progresso' },
    { value: 'Em Revisão', label: 'Em Revisão' },
    { value: 'Concluído', label: 'Concluído' }
  ];

  const priorityOptions = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Média' },
    { value: 'baixa', label: 'Baixa' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Data de Vencimento' },
    { value: 'priority', label: 'Prioridade' },
    { value: 'project', label: 'Projeto' },
    { value: 'status', label: 'Status' }
  ];

  const updateFilters = (updates: Partial<TaskFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const togglePriority = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    updateFilters({ priority: newPriority });
  };

  const clearFilters = () => {
    updateFilters({
      search: '',
      status: [],
      priority: [],
      sortBy: 'date',
      sortOrder: 'asc'
    });
  };

  const activeFiltersCount = filters.status.length + filters.priority.length + (filters.search ? 1 : 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 px-1.5 py-0.5 text-xs h-5 min-w-5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* Status Filters */}
              <div className="p-3 border-b">
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="space-y-1">
                  {statusOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                        className="w-4 h-4 rounded border-input"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filters */}
              <div className="p-3 border-b">
                <p className="text-sm font-medium mb-2">Prioridade</p>
                <div className="space-y-1">
                  {priorityOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(option.value)}
                        onChange={() => togglePriority(option.value)}
                        className="w-4 h-4 rounded border-input"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full justify-center"
                  disabled={activeFiltersCount === 0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
              updateFilters({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <div key={option.value}>
                  <SelectItem value={`${option.value}-asc`}>
                    {option.label} ↑
                  </SelectItem>
                  <SelectItem value={`${option.value}-desc`}>
                    {option.label} ↓
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Busca: "{filters.search}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => updateFilters({ search: '' })}
              />
            </Badge>
          )}
          {filters.status.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              {status}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => toggleStatus(status)}
              />
            </Badge>
          ))}
          {filters.priority.map((priority) => (
            <Badge key={priority} variant="secondary" className="flex items-center gap-1">
              {priority}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => togglePriority(priority)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}