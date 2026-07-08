import { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, AlertTriangle, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
  const [form, setForm] = useState({ medicamento: '', observacoes: '', categoria: '', laboratorio: '', responsavel: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLaboratorySuggestions, setShowLaboratorySuggestions] = useState(false);
  const [showResponsibleSuggestions, setShowResponsibleSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
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

  const responsaveisFiltrados = useMemo(() => {
    const termo = form.responsavel.trim().toLowerCase();
    if (!termo) return responsaveisDisponiveis.slice(0, 6);
    return responsaveisDisponiveis.filter((responsavel) => responsavel.toLowerCase().includes(termo)).slice(0, 6);
  }, [form.responsavel, responsaveisDisponiveis]);

  const handleSelectSuggestion = (nome) => {
    setForm({ ...form, medicamento: nome });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSubmit({
        medicamento: form.medicamento,
        observacoes: form.observacoes,
        categoria: form.categoria,
        laboratorio: form.laboratorio,
        responsavel: form.responsavel,
        status: 'pendente',
        quantidade: 0,
        distribuidora: '',
        data_anotacao: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Anotar Falta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
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

            <div className="space-y-2 relative">
              <Label htmlFor="laboratorio">Laboratório *</Label>
              <Input
                id="laboratorio"
                placeholder="Selecione ou escreva o laboratório"
                value={form.laboratorio}
                onChange={(e) => {
                  setForm({ ...form, laboratorio: e.target.value });
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

            <div className="space-y-2 relative">
              <Label htmlFor="responsavel">Responsável pela anotação *</Label>
              <Input
                id="responsavel"
                placeholder="Nome do funcionário"
                value={form.responsavel}
                onChange={(e) => {
                  setForm({ ...form, responsavel: e.target.value });
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
            <Button type="submit" disabled={isSubmitting || isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Anotar Falta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}