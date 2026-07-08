import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, Calendar, Building2 } from 'lucide-react';

export default function SearchAndFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  dateFilter,
  onDateFilterChange,
  categoryFilter,
  onCategoryChange,
  laboratoryFilter,
  onLaboratoryChange,
  laboratoryOptions = [],
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar medicamento..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[155px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="em_falta">🔴 Em Falta</SelectItem>
            <SelectItem value="pendente">🟡 Pendente</SelectItem>
            <SelectItem value="pedido_realizado">🟢 Realizados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[155px]">
            <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo período</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Esta semana</SelectItem>
            <SelectItem value="mes">Este mês</SelectItem>
            <SelectItem value="mes_passado">Mês passado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[145px]">
            <ArrowUpDown className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recente">Mais recente</SelectItem>
            <SelectItem value="antigo">Mais antigo</SelectItem>
            <SelectItem value="nome_az">Nome A-Z</SelectItem>
            <SelectItem value="nome_za">Nome Z-A</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[155px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            <SelectItem value="generico">💊Genérico / Similar</SelectItem>
            <SelectItem value="controlado">💊Controlado</SelectItem>
            <SelectItem value="antibiotico">💊Antibiótico</SelectItem>
            <SelectItem value="fralda">🚼Fralda</SelectItem>
            <SelectItem value="cosmetico">💅Cosmético</SelectItem>
            <SelectItem value="etico">💊Ético</SelectItem>
          </SelectContent>
        </Select>

        <Select value={laboratoryFilter} onValueChange={onLaboratoryChange}>
          <SelectTrigger className="w-[180px]">
            <Building2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Laboratório" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os laboratórios</SelectItem>
            {laboratoryOptions.map((laboratory) => (
              <SelectItem key={laboratory} value={laboratory}>
                {laboratory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>
    </div>
  );
}