import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import AnotarFaltaForm from '@/components/pedidos/AnotarFaltaForm';

export default function NovoPedido() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const { error } = await supabase
      .from('pedidos')
      .insert([
        {
          medicamento: data.medicamento,
          quantidade: data.quantidade,
          distribuidora: data.distribuidora,
          observacoes: data.observacoes,
          categoria: data.categoria,
          laboratorio: data.laboratorio,
          responsavel: data.responsavel,
          status: 'pendente',
          data_anotacao: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error(error);
      toast.error('Erro ao salvar pedido');
      return;
    }

    toast.success('Falta anotada com sucesso!');
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Anotar Falta
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Registre um medicamento em falta rapidamente
        </p>
      </div>

      <AnotarFaltaForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
        isSubmitting={false}
      />
    </div>
  );
}