import { useEffect, useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, AlertTriangle, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { buildObservacoesWithEan, findPedidoByEan } from './pedidoUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusInfo = {
  em_falta: { label: 'Em Falta', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  pendente: { label: 'Pendente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  pedido_realizado: { label: 'Pedido Realizado', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  pedido_chegou: {label: 'Pedido Chegou',icon: CheckCircle2,color: 'text-sky-600',bg: 'bg-sky-50 border-sky-200',
  },
};
const laboratoriosOL = [
  "ACHE",
  "BIOLAB",
  "EUROFARMA",
  "APSEN",
  "SUPERA",
];

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
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
  📋 Histórico do medicamento
</div>
      <div className="text-xs text-muted-foreground space-y-1">

  <p>
    📝 Última anotação:
    <span className="font-medium text-foreground">
      {" "}
      {formatDate(pedido.data_anotacao || pedido.created_at)}
    </span>
  </p>

  {pedido.data_pedido && (
    <p>
      📦 Último pedido:
      <span className="font-medium text-foreground">
        {" "}
        {formatDate(pedido.data_pedido)}
      </span>
    </p>
  )}

  {pedido.data_chegada && (
    <p>
      ✅ Última chegada:
      <span className="font-medium text-foreground">
        {" "}
        {formatDate(pedido.data_chegada)}
      </span>
    </p>
  )}
        {pedido.quantidade > 0 && <p>📦 Quantidade: <span className="font-medium text-foreground">{pedido.quantidade}</span></p>}
      </div>
    </div>
  );
}

export default function AnotarFaltaForm({ onSubmit, onCancel, isSubmitting }) {
  const [isOL, setIsOL] = useState(false);
  const [form, setForm] = useState({ medicamento: '', observacoes: '', categoria: '', laboratorio: '', responsavel: '', ean: '', ean_desconhecido: false });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLaboratorySuggestions, setShowLaboratorySuggestions] = useState(false);
  const [showResponsibleSuggestions, setShowResponsibleSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [matchedPedido, setMatchedPedido] = useState(null);
  const inputRef = useRef(null);

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

  const duplicado = useMemo(() => {
    const nome = form.medicamento.trim().toLowerCase();
    if (nome.length < 3) return null;
    return pedidos.find(p => p.medicamento?.toLowerCase() === nome) || null;
  }, [form.medicamento, pedidos]);

  useEffect(() => {
    if (form.ean_desconhecido || !form.ean?.trim()) {
      setMatchedPedido(null);
      return;
    }

    const pedidoEncontrado = findPedidoByEan(pedidos, form.ean);
    setMatchedPedido(pedidoEncontrado);

    if (!pedidoEncontrado) return;

    setForm((prev) => ({
      ...prev,
      medicamento: prev.medicamento?.trim() ? prev.medicamento : pedidoEncontrado.medicamento || prev.medicamento,
      categoria: prev.categoria?.trim() ? prev.categoria : pedidoEncontrado.categoria || prev.categoria,
      laboratorio: prev.laboratorio?.trim() ? prev.laboratorio : pedidoEncontrado.laboratorio || prev.laboratorio,

    }));
  }, [form.ean, form.ean_desconhecido, pedidos]);

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
    const lista = isOL
    ? laboratoriosOL
    : laboratoriosDisponiveis;
    const termo = form.laboratorio.trim().toLowerCase();
    if (!termo) return lista.slice(0, 6);
    return lista
        .filter(l =>
            l.toLowerCase().includes(termo)
        )
        .slice(0, 6);

}, [form.laboratorio, laboratoriosDisponiveis, isOL]);

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

    if (!form.ean_desconhecido && !form.ean?.trim()) {
      toast.error('Informe o EAN ou marque a opção “EAN desconhecido”.');
      return;
    }

    setIsSaving(true);

    try {
      const { ean, ean_desconhecido, ...restForm } = form;

      await onSubmit({
        ...restForm,
        ol: isOL,
        medicamento: restForm.medicamento.toUpperCase().trim(),
        laboratorio: restForm.laboratorio.toUpperCase().trim(),
        responsavel: restForm.responsavel.toUpperCase().trim(),
        observacoes: buildObservacoesWithEan(form.observacoes, form.ean, form.ean_desconhecido),
        status: 'pendente',
        quantidade: 0,
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

              {matchedPedido && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-sm text-sky-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Código encontrado</span>
                    <span className="text-xs uppercase tracking-wide text-sky-700">
  Produto com cadastro
</span>
                  </div>
                  <p className="mt-1 font-medium">{matchedPedido.medicamento}</p>
                  <div className="mt-1 text-xs text-sky-800/90 space-y-0.5">
                    {matchedPedido.laboratorio && <p>Laboratório: {matchedPedido.laboratorio}</p>}
                    {matchedPedido.categoria && <p>Categoria: {matchedPedido.categoria}</p>}
                    {matchedPedido.responsavel && <p>Responsável: {matchedPedido.responsavel}</p>}
                  </div>
                </div>
              )}
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="medicamento">Medicamento *</Label>
              <Input
                id="medicamento"
                ref={inputRef}
                placeholder="Nome do medicamento em falta"
                value={form.medicamento}
                onChange={(e) => { setForm({ ...form, medicamento: e.target.value.toUpperCase() }); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                required
                autoFocus
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((p) => {
                    return (
  <button
    key={p.id}
    type="button"
    onMouseDown={() => handleSelectSuggestion(p.medicamento)}
    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0"
  >
    <span className="text-sm font-medium text-foreground">
      {p.medicamento}
    </span>

    <span className="text-xs font-semibold text-sky-600">
      Produto com cadastro
    </span>
  </button>
);
                  })}
                </div>
              )}
            </div>

                        <div className="space-y-2 relative">
              <Label htmlFor="responsavel">Responsável pela anotação *</Label>
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
          </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="categoria">Categoria *</Label>

              <select
                id="categoria"
                value={form.categoria}
                onChange={(e) => {
                  const categoria = e.target.value;

                  setForm({ ...form, categoria,laboratorio: categoria === "etico" ? "" : form.laboratorio, });
                }}
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
              <Label htmlFor="laboratorio">
                {form.categoria === "etico"
                  ? "Laboratório (opcional)"
                  : "Laboratório *"}
              </Label>
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
                required={form.categoria !== "etico"}
              />
              <div className="flex items-center gap-3 pt-3">
              <Checkbox
                checked={isOL}
                onCheckedChange={(checked) => {
                  setIsOL(Boolean(checked));

                  setForm({
                    ...form,
                    laboratorio: "",
                  });
                }}
              />

              <Label htmlFor="ol" className="cursor-pointer">Medicamento de OL</Label>
            </div>
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
            💡 Quantidade e Laboratório podem ser preenchidos depois ao editar o pedido.
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