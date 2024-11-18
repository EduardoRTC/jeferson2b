import { useState } from 'react';
import { useQuery, useQueryClient  } from '@tanstack/react-query';
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
        throw new Error('Failed to fetch product details');
      }
      const product = await res.json();
      setEditProduct(product); // Preenche o estado com os dados completos do produto
      setOpen(true); // Abre o modal
    } catch (error) {
      console.error('Error fetching product details:', error.message);
      toast.error('Failed to load product details');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete product');
      }
      queryClient.invalidateQueries(['products']); // Recarrega a lista de produtos
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error.message);
      toast.error('Failed to delete product');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <DataTable columns={columns(handleEditProduct, deleteProduct)} data={products} searchKey="nome" />
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
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
