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
    header: 'Name',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
  },
  {
    accessorKey: 'contato',
    header: 'Contact',
  },
  {
    accessorKey: 'endereco',
    header: 'Address',
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditSupplier(supplier.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteSupplier(supplier.id)}
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
