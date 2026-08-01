import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Pencil,
  Trash2,
  Building2,
  Calendar,
  Hash,
  MessageSquare,
  PackageCheck,
  CircleDashed,
  Circle,
  Barcode,
  Copy,
  Check,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { extractEanValue, isPedidoOl } from './pedidoUtils';

const categoriaStyles = {
  generico: 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm',
  controlado: 'bg-red-400 text-red-700 border border-red-300 shadow-sm',
  antibiotico: 'bg-orange-400 text-orange-700 border border-orange-300 shadow-sm',
  fralda: 'bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm',
  cosmetico: 'bg-pink-200 text-pink-700 border border-pink-300 shadow-sm',
  etico: 'bg-green-100 text-green-700 border border-green-300 shadow-sm',
};

export default function PedidoCard({
  pedido,
  onMarkDone,
  onMarkArrived,
  onEdit,
  onDelete,
  onUpdateQuantity,
  index,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [draftQuantity, setDraftQuantity] = useState(String(pedido.quantidade ?? ''));
  const quantityInputRef = useRef(null);
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    });
  };

  const eanValue = extractEanValue(pedido);
  const isOL = isPedidoOl(pedido);

  useEffect(() => {
    setDraftQuantity(String(pedido.quantidade ?? ''));
  }, [pedido.quantidade]);

  useEffect(() => {
    if (isEditingQuantity) {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }
  }, [isEditingQuantity]);

  const handleCopyEan = async () => {
    if (!eanValue) return;
    try {
      await navigator.clipboard.writeText(eanValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveQuantity = () => {
    const nextValue = Number.parseInt(draftQuantity, 10);
    const sanitizedValue = Number.isNaN(nextValue) || nextValue < 1 ? 1 : nextValue;

    if (String(sanitizedValue) !== String(pedido.quantidade ?? '')) {
      onUpdateQuantity?.(pedido, sanitizedValue);
    }

    setDraftQuantity(String(sanitizedValue));
    setIsEditingQuantity(false);
  };

  const timelineSteps = [
    { key: 'anotado', label: 'Anotado', done: Boolean(pedido.data_anotacao), active: Boolean(pedido.data_anotacao) },
    { key: 'pedido', label: 'Pedido', done: Boolean(pedido.data_pedido), active: Boolean(pedido.data_pedido) || pedido.status === 'pedido_realizado' || pedido.status === 'pedido_chegou' },
    { key: 'chegou', label: 'Chegou', done: pedido.status === 'pedido_chegou', active: pedido.status === 'pedido_chegou' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
        <Card
          className={`
            bg-white/95
            shadow-sm
            hover:shadow-lg
            transition-all
            duration-200
            group
            rounded-2xl
            border

            ${
              isOL
                ? "border-violet-400 border-l-[6px] shadow-violet-200/50"
                : "border-border/70"
            }
          `}
        >
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            
            {/* LADO ESQUERDO */}
            <div className="flex-1 min-w-0">

              {/* TÍTULO + STATUS */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold text-foreground truncate text-base leading-tight">
                  {pedido.medicamento}
                </h3>

                <StatusBadge status={pedido.status} />

                {isOL && (
                  <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                    OL
                  </span>
                )}
              </div>

              {eanValue && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-slate-50 px-2.5 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Barcode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">EAN / Código de barras</p>
                      <p className="text-sm font-medium text-foreground truncate">{eanValue}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyEan}
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-slate-200"
                    aria-label="Copiar código de barras"
                    title="Copiar código de barras"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {/* CATEGORIA */}
              <span
                className={`inline-flex w-fit text-xs font-semibold uppercase px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105 ${
                  categoriaStyles[pedido.categoria] ||
                  'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {pedido.categoria}
              </span>

              {/* QUANTIDADE */}
              <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground/90">
                <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Qtd</span>
                {isEditingQuantity ? (
                  <input
                    ref={quantityInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={draftQuantity}
                    onChange={(e) => setDraftQuantity(e.target.value.replace(/\D/g, ''))}
                    onBlur={handleSaveQuantity}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveQuantity();
                      }
                      if (e.key === 'Escape') {
                        setDraftQuantity(String(pedido.quantidade ?? ''));
                        setIsEditingQuantity(false);
                      }
                    }}
                    className="w-14 rounded bg-background px-1.5 py-1 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingQuantity(true)}
                    className="rounded bg-transparent px-1.5 py-1 text-sm font-semibold text-foreground transition hover:bg-slate-100"
                    title="Editar quantidade"
                  >
                    {pedido.quantidade ?? 0}
                  </button>
                )}
              </div>

              {/* LABORATÓRIO */}
              {pedido.laboratorio && (
                <div className="flex items-center gap-2 text-sm text-foreground/90">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Lab: {pedido.laboratorio}</span>
                </div>
              )}

              {/* RESPONSÁVEL */}
              {pedido.responsavel && (
                <div className="flex items-center gap-2 text-sm text-foreground/90">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-medium">
                    Anotado por: {pedido.responsavel}
                  </span>
                </div>
              )}

              <div className="mt-3 rounded-2xl border border-border/70 bg-slate-50/80 p-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  <PackageCheck className="h-3.5 w-3.5" />
                  Progresso do pedido
                </div>
                <div className="flex items-center gap-2">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.done ? CheckCircle2 : step.active ? CircleDashed : Circle;
                    const isLast = index === timelineSteps.length - 1;
                    const dateValue = step.key === 'anotado'
                      ? pedido.data_anotacao
                      : step.key === 'pedido'
                        ? pedido.data_pedido
                        : pedido.status === 'pedido_chegou' ? pedido.data_pedido : null;
                    return (
                      <div key={step.key} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-start gap-1 flex-1">
                          <div className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${step.done ? 'bg-emerald-100 text-emerald-800' : step.active ? 'bg-sky-100 text-sky-800' : 'bg-white text-muted-foreground border border-border/70'}`}>
                            <Icon className="h-3.5 w-3.5" />
                            <span className="truncate">{step.label}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground ml-0.5">
                            {dateValue ? formatDate(dateValue) : '—'}
                          </span>
                        </div>
                        {!isLast && <div className={`mx-1 h-[2px] flex-1 ${step.done ? 'bg-emerald-400' : 'bg-border'}`} />} 
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OBSERVAÇÕES */}
              {pedido.observacoes && (
                <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="text-xs italic">
                    {pedido.observacoes}
                  </span>
                </div>
              )}
            </div>

            {/* AÇÕES */}
            <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 md:flex-col md:items-stretch md:min-w-[150px]">
              {pedido.status !== 'pedido_realizado' && pedido.status !== 'pedido_chegou' && (
                <Button
                  size="sm"
                  onClick={() => onMarkDone(pedido)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9 text-xs rounded-full"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Pedido realizado</span>
                </Button>
              )}

              {pedido.status === 'pedido_realizado' && (
                <Button
                  size="sm"
                  onClick={() => onMarkArrived?.(pedido)}
                  className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm h-9 text-xs rounded-full"
                >
                  <PackageCheck className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Pedido chegou</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(pedido)}
                className="h-10 w-10 text-red-600 hover:bg-red-100 rounded-full border border-red-200"
                title="Excluir pedido"
              >
                <Trash2 className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(pedido)}
                className="h-10 w-10 rounded-full border border-border/70"
                title="Editar pedido"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}