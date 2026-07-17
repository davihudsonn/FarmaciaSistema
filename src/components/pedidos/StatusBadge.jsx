import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  em_falta: {
    label: 'Em Falta',
    icon: AlertCircle,
    className: 'bg-red-500 text-white border-red-600',
  },
  pendente: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-amber-400 text-amber-900 border-amber-500',
  },
  pedido_realizado: {
    label: 'Pedido Realizado',
    icon: CheckCircle2,
    className: 'bg-emerald-500 text-white border-emerald-600',
  },
  pedido_chegou: {
    label: 'Pedido Chegou',
    icon: CheckCircle2,
    className: 'bg-sky-600 text-white border-sky-700',
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.em_falta;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-semibold py-1 px-2.5 shadow-sm", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}