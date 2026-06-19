import { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, AlertTriangle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusInfo = {
  em_falta: { label: 'Em Falta', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  pendente: { label: 'Pendente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  pedido_realizado: { label: 'Pedido Realizado', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
};

function DuplicateAlert({ pedido }) {
  const info = statusInfo[pedido.status] || statusInfo.em_falta;
  const Icon = info.icon;
  const formatDate = (d) => d ? format(new Date(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : null;

  return (
    <div className={`rounded-lg border p-3 ${info.bg} space-y-1.5`}>
      <div className="flex items-center gap-2 font-semibold text-sm">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        <span>Medicamento já anotado!</span>
      </div>
      <div className={`flex items-center gap-1.5 text-sm ${info.color} font-medium`}>
        <Icon className="h-4 w-4" />
        Status atual: <strong>{info.label}</strong>
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>📝 Anotado em: <span className="font-medium text-foreground">{formatDate(pedido.data_anotacao || pedido.created_date)}</span></p>
        {pedido.data_pedido && (
          <p>✅ Pedido realizado em: <span className="font-medium text-foreground">{formatDate(pedido.data_pedido)}</span></p>
        )}
        {pedido.distribuidora && <p>🏢 Distribuidora: <span className="font-medium text-foreground">{pedido.distribuidora}</span></p>}
        {pedido.quantidade > 0 && <p>📦 Quantidade: <span className="font-medium text-foreground">{pedido.quantidade}</span></p>}
      </div>
    </div>
  );
}

export default function AnotarFaltaForm({ onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({ medicamento: '', observacoes: '',categoria: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date', 200),
  });

  const duplicado = useMemo(() => {
    const nome = form.medicamento.trim().toLowerCase();
    if (nome.length < 3) return null;
    return pedidos.find(p => p.medicamento?.toLowerCase() === nome) || null;
  }, [form.medicamento, pedidos]);

  const suggestions = useMemo(() => {
    const termo = form.medicamento.trim().toLowerCase();
    if (termo.length < 1) return [];
    return pedidos
      .filter(p => p.medicamento?.toLowerCase().includes(termo) && p.medicamento?.toLowerCase() !== termo)
      .slice(0, 6);
  }, [form.medicamento, pedidos]);

  const handleSelectSuggestion = (nome) => {
    setForm({ ...form, medicamento: nome });
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      medicamento: form.medicamento,
      observacoes: form.observacoes,
      categoria: form.categoria,
      status: 'pendente',
      quantidade: 0,
      distribuidora: '',
      data_anotacao: new Date().toISOString(),
    });
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Anotar Falta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="medicamento">Medicamento *</Label>
            <Input
              id="medicamento"
              ref={inputRef}
              placeholder="Nome do medicamento em falta"
              value={form.medicamento}
              onChange={(e) => { setForm({ ...form, medicamento: e.target.value }); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              required
              autoFocus
              autoComplete="off"
            />
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>

              <select
                id="categoria"
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                <option value="">Selecione a categoria</option>
                <option value="generico">💊Genérico / Similar</option>
                <option value="controlado">💊Controlado</option>
                <option value="antibiotico">💊Antibiótico</option>
                <option value="fralda">🚼Fralda</option>
                <option value="cosmetico">💅Cosmético</option>
                <option value="etico">💊Ético</option>
              </select>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((p) => {
                  const info = statusInfo[p.status] || statusInfo.em_falta;
                  const Icon = info.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(p.medicamento)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm font-medium text-foreground">{p.medicamento}</span>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${info.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {info.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {duplicado && <DuplicateAlert pedido={duplicado} />}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea
              id="observacoes"
              placeholder="Ex: acabou ontem, avisar urgente..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={3}
            />
          </div>

          <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            💡 Quantidade e distribuidora podem ser preenchidos depois ao editar o pedido.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1.5" />
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-1.5" />
              Anotar Falta
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}