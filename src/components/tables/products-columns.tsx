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
    header: 'Nome',
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
  },
  {
    accessorKey: 'preco',
    header: 'Preço',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('preco'));
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price);
    },
  },
  {
    accessorKey: 'quantidade',
    header: 'Quantidade',
  },
  {
    accessorKey: 'imagem',
    header: 'Imagem',
    cell: ({ row }) => {
      const image = row.getValue('imagem');
      return image ? (
        <img src={image} alt={row.getValue('nome')} className="w-12 h-12 object-cover" />
      ) : (
        <span>Sem Imagem</span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      // Verifica os dados do produto
      console.log('Dados do produto:', product);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                if (product?.id) {
                  handleEditProduct(product.id);
                } else {
                  console.error('ID do produto está ausente');
                }
              }}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteProduct(product.id)}
              className="text-red-600"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
