import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export const columns: (
  handleEditProduct: (productId: string) => void,
  deleteProduct: (id: string) => void
) => ColumnDef<any>[] = (handleEditProduct, deleteProduct) => [
  {
    accessorKey: 'nome',
    header: 'Name',
  },
  {
    accessorKey: 'descricao',
    header: 'Description',
  },
  {
    accessorKey: 'preco',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('preco'));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    },
  },
  {
    accessorKey: 'quantidade',
    header: 'Quantity',
  },
  {
    accessorKey: 'imagem',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.getValue('imagem');
      return image ? (
        <img src={image} alt={row.getValue('nome')} className="w-12 h-12 object-cover" />
      ) : (
        <span>No Image</span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      // Verifica os dados do produto
      console.log('Product data:', product);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                if (product?.id) {
                  handleEditProduct(product.id);
                } else {
                  console.error('Product ID is missing');
                }
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteProduct(product.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
