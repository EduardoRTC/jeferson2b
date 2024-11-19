import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { ProductForm } from '@/components/forms/product-form';
import { columns } from '@/components/tables/products-columns';

export default function Products() {
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/products');
      return res.json();
    },
  });

  const handleEditProduct = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${productId}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar detalhes do produto');
      }
      const product = await res.json();
      setEditProduct(product); // Preenche o estado com os dados completos do produto
      setOpen(true); // Abre o modal
    } catch (error) {
      console.error('Erro ao buscar detalhes do produto:', error.message);
      toast.error('Falha ao carregar os detalhes do produto');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Falha ao excluir o produto');
      }
      queryClient.invalidateQueries(['products']); // Recarrega a lista de produtos
      toast.success('Produto excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir o produto:', error.message);
      toast.error('Falha ao excluir o produto');
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>
      <DataTable
        columns={columns(handleEditProduct, deleteProduct)}
        data={products}
        searchKey="nome"
      />
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editProduct ? 'Editar Produto' : 'Adicionar Produto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              initialData={editProduct}
              onSuccess={() => {
                setOpen(false);
                setEditProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
