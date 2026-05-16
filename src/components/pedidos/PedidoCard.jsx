import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle2, Pencil, Trash2, Building2, Calendar, Hash, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function PedidoCard({ pedido, onMarkDone, onEdit, onDelete, index }) {
  console.log("CATEGORIA:", pedido.categoria)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold text-foreground truncate text-base">{pedido.medicamento}</h3>
                <StatusBadge status={pedido.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-muted-foreground">
                {pedido.categoria && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {pedido.categoria}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span>Qtd: <span className="text-foreground font-medium">{pedido.quantidade}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{pedido.distribuidora}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">Anotado: {formatDate(pedido.data_anotacao)}</span>
                </div>
                {pedido.data_pedido && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="text-xs">Pedido: {formatDate(pedido.data_pedido)}</span>
                  </div>
                )}
              </div>

              {pedido.observacoes && (
                <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="text-xs italic">{pedido.observacoes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {pedido.status !== 'pedido_realizado' && (
                <Button
                  size="sm"
                  onClick={() => onMarkDone(pedido)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Realizado</span>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(pedido)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(pedido)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}