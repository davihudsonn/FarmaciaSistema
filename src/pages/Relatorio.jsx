import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from "xlsx";
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PackageCheck, CheckCircle, AlertCircle, Download } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export default function Relatorio() {
  const [period, setPeriod] = useState('todos'); // 'todos' | 'semana' | 'mes'

  const { data: allPedidos = [], isLoading } = useQuery({
    queryKey: ['relatorio-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('id, medicamento, created_at, data_anotacao, data_pedido, data_chegada, deleted_at, status, categoria, laboratorio, responsavel, quantidade, observacoes, ean')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const now = new Date();

  const getEventDate = (pedido) => pedido.data_anotacao || pedido.data_pedido || pedido.created_at;

  const withinPeriod = (dateStr) => {
    if (period === 'todos') return true;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const cutoff = new Date(now);
    if (period === 'semana') {
      cutoff.setDate(now.getDate() - 7);
    }
    if (period === 'mes') {
      cutoff.setDate(now.getDate() - 30);
    }
    cutoff.setHours(0, 0, 0, 0);
    return d >= cutoff;
  };

  const filtered = useMemo(() => allPedidos || [], [allPedidos]);

  const periodFilteredActive = useMemo(
    () => filtered.filter((p) => !p.deleted_at && withinPeriod(getEventDate(p))),
    [filtered, period],
  );

  const periodFilteredArrived = useMemo(
    () => filtered.filter((p) => p.status === 'pedido_chegou' && withinPeriod(p.data_chegada || p.data_pedido || p.data_anotacao || p.created_at)),
    [filtered, period],
  );

  const periodFiltered = useMemo(
    () => [...periodFilteredActive, ...periodFilteredArrived],
    [periodFilteredActive, periodFilteredArrived],
  );

  const generalStats = useMemo(() => {
  const total = periodFiltered.length;

  const arrived = periodFilteredArrived.length;

  const pending = periodFilteredActive.filter(
    (p) => p.status === 'pendente'
  ).length;

  const completed = periodFilteredActive.filter(
    (p) => p.status === 'pedido_realizado'
  ).length;

  const emFalta = periodFilteredActive.filter(
    (p) => p.status === 'em_falta'
  ).length;

  return {
    total,
    arrived,
    pending,
    completed,
    emFalta,
    arrivalRate: total > 0 ? ((arrived / total) * 100).toFixed(1) : 0,
  };
}, [periodFiltered, periodFilteredActive, periodFilteredArrived]);

  const arrivedMedicamentos = useMemo(() => {
    const map = new Map();
    periodFilteredArrived.forEach((p) => {
      const med = p.medicamento || 'Sem medicamento';
      map.set(med, (map.get(med) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [periodFilteredArrived]);

  const topMedicamentos = useMemo(() => {
    const map = new Map();
    periodFilteredActive.forEach((p) => {
      const med = p.medicamento || 'Sem medicamento';
      map.set(med, (map.get(med) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [periodFilteredActive]);

  const statusData = useMemo(() => {
    const map = new Map();
    periodFilteredActive.forEach((p) => {
      const status = p.status || 'Sem status';
      map.set(status, (map.get(status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => {
      const displayName = name === 'em_falta' ? 'Em Falta' : name === 'pedido_realizado' ? 'Realizado' : name === 'pendente' ? 'Pendente' : name;
      return { name: displayName, value };
    });
  }, [periodFilteredActive]);

  const categoryData = useMemo(() => {
    const map = new Map();
    periodFilteredActive.forEach((p) => {
      const cat = p.categoria || 'Sem categoria';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [periodFilteredActive]);

  const dailyData = useMemo(() => {
    const map = new Map();
    const days = period === 'mes' ? 30 : period === 'semana' ? 7 : 7;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      map.set(dateStr, 0);
    }
    periodFilteredActive.forEach((p) => {
      const c = getEventDate(p);
      if (!c) return;
      const d = new Date(c);
      const dateStr = d.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
      if (map.has(dateStr)) map.set(dateStr, map.get(dateStr) + 1);
    });
    return Array.from(map.entries()).map(([date, quantidade]) => ({ date, quantidade }));
  }, [periodFilteredActive, period]);

const exportToExcel = () => {
  const rows = (periodFiltered || []).map((pedido) => ({
    Medicamento: pedido.medicamento || "-",
    Categoria: pedido.categoria || "-",
    Laboratório: pedido.laboratorio || "-",
    Responsável: pedido.responsavel || "-",
    Status: pedido.status || "-",
    Quantidade: pedido.quantidade || 0,
    Observações: pedido.observacoes || "-",
    "Data da Anotação": formatDate(pedido.data_anotacao),
    "Data do Pedido": formatDate(pedido.data_pedido),
    Registro: pedido.deleted_at ? "Excluído" : "Ativo",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!autofilter"] = {
    ref: worksheet["!ref"],
  };

  worksheet["!cols"] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 50 },
    { wch: 22 },
    { wch: 22 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

  XLSX.writeFile(
    workbook,
    `relatorio-pedidos-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};

  if (isLoading) return <div className="space-y-4">{[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-32 rounded-xl"/>))}</div>;

  /** @param {string} d */
  const formatDate = (d) => d ? new Date(d).toLocaleString('pt-BR') : '-';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatório</h1>
        <p className="text-muted-foreground text-sm mt-1">Análise completa de medicamentos anotados, pedidos realizados e pedidos que chegaram</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Período:</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="p-2 border rounded">
          <option value="todos">Todos</option>
          <option value="semana">Última semana</option>
          <option value="mes">Último mês</option>
        </select>

        <button
          type="button"
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{generalStats.total}</div><p className="text-xs text-muted-foreground mt-1">medicamentos</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{generalStats.pending}</div><p className="text-xs text-muted-foreground mt-1">em aberto</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Realizados</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{generalStats.completed}</div><p className="text-xs text-muted-foreground mt-1">pedidos</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Chegaram</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{generalStats.arrived}</div><p className="text-xs text-muted-foreground mt-1">medicamentos</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Taxa Chegada</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{generalStats.arrivalRate}%</div><p className="text-xs text-muted-foreground mt-1">do total</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="medicamentos-chegados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="medicamentos-chegados">Chegaram</TabsTrigger>
          <TabsTrigger value="medicamentos-ativos">Pendentes</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="medicamentos-chegados">
          <Card>
            <CardHeader><CardTitle>Medicamentos que chegaram</CardTitle><CardDescription>Top 8 recebidos</CardDescription></CardHeader>
            <CardContent>
              {arrivedMedicamentos.length > 0 ? arrivedMedicamentos.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Última chegada: {formatDate(filtered.find(p => p.medicamento === item.name && p.status === 'pedido_chegou')?.data_chegada || filtered.find(p => p.medicamento === item.name && p.status === 'pedido_chegou')?.data_pedido)}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">{item.value}</Badge>
                </div>
              )) : <p className="text-muted-foreground text-sm">Nenhum medicamento chegou ainda</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicamentos-ativos">
          <Card>
            <CardHeader><CardTitle>Medicamentos Mais Anotados</CardTitle><CardDescription>Top 8 em falta</CardDescription></CardHeader>
            <CardContent>
              {topMedicamentos.length > 0 ? topMedicamentos.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Última anotação: {formatDate(filtered.find(p => p.medicamento === item.name && !p.deleted_at)?.created_at)}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2">{item.value}</Badge>
                </div>
              )) : <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader><CardTitle>Distribuição por Status</CardTitle><CardDescription>Proporção por status</CardDescription></CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}` }>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Quantidade']} labelFormatter={(label) => label} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader><CardTitle>Distribuição por Categoria</CardTitle><CardDescription>Medicamentos por categoria</CardDescription></CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}` }>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, 'Quantidade']}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader><CardTitle>Anotações</CardTitle><CardDescription>Últimos registros</CardDescription></CardHeader>
            <CardContent>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="quantidade" fill="#3b82f6" /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
