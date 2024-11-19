import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CustomerForm } from '@/components/forms/customer-form';
import { columns } from '@/components/tables/customers-columns';
import { toast } from 'sonner';

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null); // Estado para cliente em edição
  const queryClient = useQueryClient();

  // Fetch clientes
  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/clientes', { method: 'GET' });
      if (!res.ok) {
        throw new Error('Falha ao buscar clientes');
      }
      return res.json();
    },
  });

  // Função para abrir o modal de edição
  const handleEditCustomer = async (customerId) => {
    try {
      const res = await fetch(`http://localhost:3000/clientes/${customerId}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar detalhes do cliente');
      }
      const customer = await res.json();
      setEditCustomer(customer); // Preenche o estado com os dados completos do cliente
      setOpen(true); // Abre o modal
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error.message);
      toast.error('Falha ao carregar os detalhes do cliente');
    }
  };

  // Função para deletar cliente
  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/clientes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Falha ao excluir cliente');
      }

      toast.success('Cliente excluído com sucesso');
      queryClient.invalidateQueries(['customers']);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error.message);
      toast.error('Falha ao excluir cliente');
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar clientes. Tente novamente.</div>;

  const customerColumns = columns(handleEditCustomer, deleteCustomer); // Passa as funções para as colunas

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditCustomer(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editCustomer ? 'Editar Cliente' : 'Adicionar Cliente'}</DialogTitle>
            </DialogHeader>
            <CustomerForm
              initialData={editCustomer}
              onSuccess={() => {
                setOpen(false);
                setEditCustomer(null);
                queryClient.invalidateQueries(['customers']); // Atualiza a lista de clientes
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={customerColumns} data={customers.clientes} searchKey="nome" />
    </div>
  );
}
