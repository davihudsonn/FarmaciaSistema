import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { buildObservacoesWithEan, findPedidoByEan } from './pedidoUtils';

const LABORATORIOS_OL = [
  "ACHE",
  "BIOLAB",
  "EUROFARMA",
  "APSEN",
  "SUPERA",
];

export default function PedidoForm({ pedido, onSubmit, onCancel, isSubmitting }) {
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [showLaboratorySuggestions, setShowLaboratorySuggestions] = useState(false);
  const [showResponsibleSuggestions, setShowResponsibleSuggestions] = useState(false);
  const [form, setForm] = useState({
    medicamento: '',
    quantidade: '',
    observacoes: '',
    status: 'em_falta',
    categoria: '',
    laboratorio: '',
    responsavel: '',
    ean: '',
    ean_desconhecido: false,
    ol:false,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const medicamentosDisponiveis = useMemo(() => {
    const nomes = [
      ...(form.medicamento ? [form.medicamento] : []),
      ...pedidos.map((p) => p.medicamento).filter(Boolean),
    ];

    return Array.from(new Set(nomes.map((nome) => nome.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [form.medicamento, pedidos]);

  const medicamentosFiltrados = useMemo(() => {
    const termo = form.medicamento.trim().toLowerCase();
    if (!termo) return medicamentosDisponiveis.slice(0, 6);
    return medicamentosDisponiveis.filter((medicamento) => medicamento.toLowerCase().includes(termo)).slice(0, 6);
  }, [form.medicamento, medicamentosDisponiveis]);

  const laboratoriosDisponiveis = useMemo(() => {
    const nomes = [
      ...(form.laboratorio ? [form.laboratorio] : []),
      ...pedidos.map((p) => p.laboratorio).filter(Boolean),
    ];

    return Array.from(new Set(nomes.map((nome) => nome.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [form.laboratorio, pedidos]);

  const laboratoriosFiltrados = useMemo(() => {
    const termo = form.laboratorio.trim().toLowerCase();
    if (!termo) return laboratoriosDisponiveis.slice(0, 6);
    return laboratoriosDisponiveis.filter((laboratorio) => laboratorio.toLowerCase().includes(termo)).slice(0, 6);
  }, [form.laboratorio, laboratoriosDisponiveis]);

  const responsaveisDisponiveis = useMemo(() => {
    const nomes = [
      ...(form.responsavel ? [form.responsavel] : []),
      ...pedidos.map((p) => p.responsavel).filter(Boolean),
    ];

    return Array.from(new Set(nomes.map((nome) => nome.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [form.responsavel, pedidos]);

  useEffect(() => {
    if (form.ean_desconhecido || !form.ean?.trim()) return;

    const pedidoEncontrado = findPedidoByEan(pedidos, form.ean);
    if (!pedidoEncontrado) return;

    setForm((prev) => ({
      ...prev,
      medicamento: prev.medicamento?.trim() ? prev.medicamento : pedidoEncontrado.medicamento || prev.medicamento,
      categoria: prev.categoria?.trim() ? prev.categoria : pedidoEncontrado.categoria || prev.categoria,
      laboratorio: prev.laboratorio?.trim() ? prev.laboratorio : pedidoEncontrado.laboratorio || prev.laboratorio,
      responsavel: prev.responsavel?.trim() ? prev.responsavel : pedidoEncontrado.responsavel || prev.responsavel,
      observacoes: prev.observacoes?.trim() ? prev.observacoes : pedidoEncontrado.observacoes || prev.observacoes,
    }));
  }, [form.ean, form.ean_desconhecido, pedidos]);

  const responsaveisFiltrados = useMemo(() => {
    const termo = form.responsavel.trim().toLowerCase();
    if (!termo) return responsaveisDisponiveis.slice(0, 6);
    return responsaveisDisponiveis.filter((responsavel) => responsavel.toLowerCase().includes(termo)).slice(0, 6);
  }, [form.responsavel, responsaveisDisponiveis]);

  useEffect(() => {
    if (pedido) {
      setForm({
        medicamento: pedido.medicamento || '',
        quantidade: pedido.quantidade || '',
        observacoes: pedido.observacoes || '',
        status: pedido.status || 'em_falta',
        categoria: pedido.categoria || '',
        laboratorio: pedido.laboratorio || '',
        responsavel: pedido.responsavel || '',
        ean: pedido.ean || '',
        ean_desconhecido: Boolean(pedido.ean_desconhecido),
        ol: Boolean(pedido.ol),
      });
    }
  }, [pedido]);

  const handleSubmit = (e) => {
  e.preventDefault();
  try {
    const { ean, ean_desconhecido, ...restForm } = form;
    onSubmit({
      ...restForm,
      ol: form.ol,
      ean,
      ean_desconhecido,
      observacoes: buildObservacoesWithEan(
        form.observacoes,
        ean,
        ean_desconhecido
      ),
      quantidade: Number(form.quantidade) || 0,
      data_anotacao: pedido?.data_anotacao || new Date().toISOString(),
    });

  } catch (err) {

  }
};

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{pedido ? 'Editar Pedido' : 'Novo Pedido'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="medicamento">Medicamento *</Label>
                <Input
                  id="medicamento"
                  placeholder="Nome do medicamento"
                  value={form.medicamento}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      medicamento: e.target.value.toUpperCase(),
                    });
                    setShowMedicineSuggestions(true);
                  }}
                  onFocus={() => setShowMedicineSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowMedicineSuggestions(false), 150)}
                  required
                />
              {showMedicineSuggestions && medicamentosFiltrados.length > 0 && (
                <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {medicamentosFiltrados.map((medicamento) => (
                    <button
                      key={medicamento}
                      type="button"
                      onMouseDown={() => {
                        setForm({ ...form, medicamento });
                        setShowMedicineSuggestions(false);
                      }}
                      className="w-full px-3 py-2.5 hover:bg-muted/60 transition-colors text-left text-sm font-medium text-foreground border-b border-border/50 last:border-0"
                    >
                      {medicamento}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                placeholder="Ex: 10"
                value={form.quantidade}
                onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ean">EAN / Código de barras</Label>
              <Input
                id="ean"
                placeholder="Ex: 7891234567890"
                value={form.ean}
                onChange={(e) => setForm({ ...form, ean: e.target.value })}
                disabled={form.ean_desconhecido}
                inputMode="numeric"
                maxLength={20}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={form.ean_desconhecido}
                  onCheckedChange={(checked) => setForm({ ...form, ean_desconhecido: Boolean(checked), ean: Boolean(checked) ? '' : form.ean })}
                />
                EAN desconhecido
              </label>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="laboratorio">Laboratório *</Label>
              <Input
                id="laboratorio"
                placeholder="Selecione ou escreva o laboratório"
                value={form.laboratorio}
                onChange={(e) => {
                  setForm({ ...form, laboratorio: e.target.value.toUpperCase() });
                  setShowLaboratorySuggestions(true);
                }}
                onFocus={() => setShowLaboratorySuggestions(true)}
                onBlur={() => setTimeout(() => setShowLaboratorySuggestions(false), 150)}
                required
              />
              {showLaboratorySuggestions && laboratoriosFiltrados.length > 0 && (
                <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {laboratoriosFiltrados.map((laboratorio) => (
                    <button
                      key={laboratorio}
                      type="button"
                      onMouseDown={() => {
                        setForm({ ...form, laboratorio });
                        setShowLaboratorySuggestions(false);
                      }}
                      className="w-full px-3 py-2.5 hover:bg-muted/60 transition-colors text-left text-sm font-medium text-foreground border-b border-border/50 last:border-0"
                    >
                      {laboratorio}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                placeholder="Nome do funcionário"
                value={form.responsavel}
                onChange={(e) => {
                  setForm({ ...form, responsavel: e.target.value.toUpperCase() });
                  setShowResponsibleSuggestions(true);
                }}
                onFocus={() => setShowResponsibleSuggestions(true)}
                onBlur={() => setTimeout(() => setShowResponsibleSuggestions(false), 150)}
                required
              />
              {showResponsibleSuggestions && responsaveisFiltrados.length > 0 && (
                <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {responsaveisFiltrados.map((responsavel) => (
                    <button
                      key={responsavel}
                      type="button"
                      onMouseDown={() => {
                        setForm({ ...form, responsavel });
                        setShowResponsibleSuggestions(false);
                      }}
                      className="w-full px-3 py-2.5 hover:bg-muted/60 transition-colors text-left text-sm font-medium text-foreground border-b border-border/50 last:border-0"
                    >
                      {responsavel}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_falta">🔴 Em Falta</SelectItem>
                  <SelectItem value="pendente">🟡 Pendente</SelectItem>
                  <SelectItem value="pedido_realizado">🟢 Pedido Realizado</SelectItem>
                  <SelectItem value="pedido_chegou">✅ Pedido Chegou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1.5" />
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-1.5" />
              {pedido ? 'Salvar Alterações' : 'Cadastrar Pedido'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}