import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

import StatsCards from '@/components/pedidos/StatsCards';
import PedidoCard from '@/components/pedidos/PedidoCard';

import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Package, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const queryClient = useQueryClient();

  // ===================== ESTADOS =====================
  const [editingPedido, setEditingPedido] = useState(null);

  // ===================== LISTAR PEDIDOS ATIVOS =====================
const { data: pedidos = [], isLoading } = useQuery({
  queryKey: ['pedidos'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
});
  // ===================== UPDATE =====================
  const updateMutation = useMutation({
  mutationFn: async ({ id, data }) => {
    const { error } = await supabase
      .from('pedidos')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    toast.success('Pedido atualizado!');
  },
});

  // ===================== DELETE (SOFT DELETE) =====================
const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const { error } = await supabase
      .from('pedidos')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    toast.success('Pedido excluído!');
  },
});

  // ===================== AÇÕES =====================
const handleDelete = (pedido) => {
  deleteMutation.mutate(pedido.id);
};

const handleEdit = (pedido) => {
  setEditingPedido(pedido);
};

const handleMarkDone = (pedido) => {
  updateMutation.mutate({
    id: pedido.id,
    data: {
      status: 'pedido_realizado',
      data_pedido: new Date().toISOString(),
    },
  });
};

  // ===================== FILTRO =====================
  const recentPending = pedidos
    .filter(p => p.status !== 'pedido_realizado')
    .slice(0, 5);

  // ===================== LOADING =====================
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ===================== UI =====================
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral dos pedidos da farmácia
          </p>
        </div>

        <Link to="/novo-pedido">
          <Button className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Novo Pedido</span>
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <StatsCards pedidos={pedidos} />

      {/* HEADER LISTA */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Pendentes e Em Falta
        </h2>

        <div className="flex gap-2">
          <Link
            to="/relatorio"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Relatório
          </Link>
          <Link
            to="/pedidos"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* LISTA */}
      <div>
        {recentPending.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Nenhum pedido pendente no momento.
            </p>

            <Link to="/novo-pedido">
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-1.5" />
                Cadastrar Pedido
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPending.map((pedido, i) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                index={i}
                onMarkDone={handleMarkDone}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingPedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Editar Pedido
            </h2>

            <button
              className="w-full bg-primary text-white p-2 rounded"
              onClick={() => setEditingPedido(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}