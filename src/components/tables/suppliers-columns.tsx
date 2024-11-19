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
  handleEditSupplier: (supplierId: string) => void,
  deleteSupplier: (id: string) => void
) => ColumnDef<any>[] = (handleEditSupplier, deleteSupplier) => [
  {
    accessorKey: 'nome',
    header: 'Nome',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
  },
  {
    accessorKey: 'contato',
    header: 'Contato',
  },
  {
    accessorKey: 'endereco',
    header: 'Endereço',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditSupplier(supplier.id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteSupplier(supplier.id)}
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
