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
import { SupplierForm } from '@/components/forms/supplier-form';
import { columns } from '@/components/tables/suppliers-columns';

export default function Suppliers() {
  const [open, setOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const queryClient = useQueryClient();

  const { data: suppliers, isLoading, isError } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/fornecedores');
      if (!res.ok) {
        throw new Error('Falha ao buscar fornecedores');
      }
      return res.json();
    },
  });

  const handleEditSupplier = async (supplierId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/fornecedores/${supplierId}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar detalhes do fornecedor');
      }

      const supplier = await res.json();
      setEditSupplier(supplier);
      setOpen(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do fornecedor:', error.message);
    }
  };

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:3000/fornecedores/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Falha ao excluir fornecedor');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
    },
    onError: (error: any) => {
      console.error('Falha ao excluir fornecedor:', error.message);
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar fornecedores.</div>;

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditSupplier(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              initialData={editSupplier}
              onSuccess={() => {
                setOpen(false);
                setEditSupplier(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns(handleEditSupplier, deleteSupplier.mutate)}
        data={suppliers}
        searchKey="nome"
      />
    </div>
  );
}
