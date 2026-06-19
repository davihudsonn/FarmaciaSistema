import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

import PedidoCard from '@/components/pedidos/PedidoCard';
import SearchAndFilters from '@/components/pedidos/SearchAndFilters';
import PedidoForm from '@/components/pedidos/PedidoForm';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Package, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export default function Pedidos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('recente');
  const [dateFilter, setDateFilter] = useState('todos');
  const [editingPedido, setEditingPedido] = useState(null);
  const [deletingPedido, setDeletingPedido] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('todos');

  const queryClient = useQueryClient();

  // ===================== LISTAR =====================
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
      setEditingPedido(null);
    },
  });

  // ===================== DELETE =====================
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
      setDeletingPedido(null);
    },
  });

  const handleMarkDone = (pedido) => {
    updateMutation.mutate({
      id: pedido.id,
      data: {
        status: 'pedido_realizado',
        data_pedido: new Date().toISOString(),
      },
    });
  };

  const handleUpdate = (formData) => {
    updateMutation.mutate({
      id: editingPedido.id,
      data: formData,
    });
  };

  // ===================== FILTROS =====================
  const getPedidoDate = (p) => {
    const value = p.data_anotacao || p.data_pedido || p.created_at || p.created_date;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const matchesDateFilter = (p) => {
    if (dateFilter === 'todos') return true;

    const date = getPedidoDate(p);
    if (!date) return false;

    const now = new Date();

    if (dateFilter === 'hoje') {
      return date.toDateString() === now.toDateString();
    }

    if (dateFilter === 'semana') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }

    if (dateFilter === 'mes') {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true;
  };

  let filtered = pedidos.filter((p) => {
  const matchSearch =
    p.medicamento?.toLowerCase().includes(search.toLowerCase()) ||
    p.distribuidora?.toLowerCase().includes(search.toLowerCase());

  const matchStatus =
    statusFilter === 'todos' || p.status === statusFilter;

  const matchCategory =
    categoryFilter === 'todos' || p.categoria === categoryFilter;

  return matchSearch && matchStatus && matchCategory && matchesDateFilter(p);
});

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'recente': {
        const dateA = getPedidoDate(a);
        const dateB = getPedidoDate(b);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      }
      case 'antigo': {
        const dateA = getPedidoDate(a);
        const dateB = getPedidoDate(b);
        return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
      }
      case 'nome_az':
        return (a.medicamento || '').localeCompare(b.medicamento || '');
      case 'nome_za':
        return (b.medicamento || '').localeCompare(a.medicamento || '');
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Pedidos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} medicamento(s) encontrado(s)
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/relatorio">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Relatório
            </Button>
          </Link>
          <Link to="/novo-pedido">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Anotar Falta
            </Button>
          </Link>
        </div>
      </div>

      {/* FILTERS */}
      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* EMPTY */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border">
          <Package className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            Nenhum pedido encontrado
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pedido, i) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              index={i}
              onMarkDone={handleMarkDone}
              onEdit={setEditingPedido}
              onDelete={setDeletingPedido}
            />
          ))}
        </div>
      )}

      {/* EDIT */}
      <Dialog
        open={!!editingPedido}
        onOpenChange={(open) => !open && setEditingPedido(null)}
      >
        <DialogContent className="max-w-2xl p-0 border-none">
          <PedidoForm
            pedido={editingPedido}
            onSubmit={handleUpdate}
            onCancel={() => setEditingPedido(null)}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <AlertDialog
        open={!!deletingPedido}
        onOpenChange={(open) => !open && setDeletingPedido(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido será removido da lista, mas será salvo no histórico para análise.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deletingPedido.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}