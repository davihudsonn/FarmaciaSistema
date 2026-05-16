import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { key: 'total', label: 'Total de Itens', icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'em_falta', label: 'Em Falta', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'pendente', label: 'Pendentes', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'pedido_realizado', label: 'Realizados', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function StatsCards({ pedidos }) {
  const counts = {
    total: pedidos.length,
    em_falta: pedidos.filter(p => p.status === 'em_falta').length,
    pendente: pedidos.filter(p => p.status === 'pendente').length,
    pedido_realizado: pedidos.filter(p => p.status === 'pedido_realizado').length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">{counts[stat.key]}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}