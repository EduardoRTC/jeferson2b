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

  // Fetch customers
  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/clientes', { method: 'GET' });
      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }
      return res.json();
    },
  });

  // Função para abrir o modal de edição
  const handleEditCustomer = async (customerId) => {
    try {
      const res = await fetch(`http://localhost:3000/clientes/${customerId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch customer details');
      }
      const customer = await res.json();
      setEditCustomer(customer); // Preenche o estado com os dados completos do cliente
      setOpen(true); // Abre o modal
    } catch (error) {
      console.error('Error fetching customer details:', error.message);
      toast.error('Failed to load customer details');
    }
  };

  // Função para deletar cliente
  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/clientes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete customer');
      }

      toast.success('Customer deleted successfully');
      queryClient.invalidateQueries(['customers']);
    } catch (error) {
      console.error('Error deleting customer:', error.message);
      toast.error('Failed to delete customer');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading customers. Please try again.</div>;

  const customerColumns = columns(handleEditCustomer, deleteCustomer); // Passa as funções para as colunas

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditCustomer(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
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
