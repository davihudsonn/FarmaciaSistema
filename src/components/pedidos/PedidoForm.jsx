import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

export default function PedidoForm({ pedido, onSubmit, onCancel, isSubmitting }) {
  const [form, setForm] = useState({
    medicamento: '',
    quantidade: '',
    distribuidora: '',
    observacoes: '',
    status: 'em_falta',
    categoria: '',
  });

  useEffect(() => {
    if (pedido) {
      setForm({
        medicamento: pedido.medicamento || '',
        quantidade: pedido.quantidade || '',
        distribuidora: pedido.distribuidora || '',
        observacoes: pedido.observacoes || '',
        status: pedido.status || 'em_falta',
        categoria: pedido.categoria || '',
      });
    }
  }, [pedido]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantidade: Number(form.quantidade),
      data_anotacao: pedido?.data_anotacao || new Date().toISOString(),
    });
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{pedido ? 'Editar Pedido' : 'Novo Pedido'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicamento">Medicamento *</Label>
              <Input
                id="medicamento"
                placeholder="Nome do medicamento"
                value={form.medicamento}
                onChange={(e) => setForm({ ...form, medicamento: e.target.value })}
                required
              />
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
              <Label htmlFor="distribuidora">Distribuidora <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input
                id="distribuidora"
                placeholder="Nome da distribuidora"
                value={form.distribuidora}
                onChange={(e) => setForm({ ...form, distribuidora: e.target.value })}
              />
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