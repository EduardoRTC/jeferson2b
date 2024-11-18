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
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export const columns: (handleEditCustomer: (customerId: string) => void, deleteCustomer: (id: string) => void) => ColumnDef<any>[] = (
  handleEditCustomer,
  deleteCustomer
) => [
  {
    accessorKey: 'nome',
    header: 'Name',
  },
  {
    accessorKey: 'cpf_cnpj',
    header: 'Document',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'contato',
    header: 'Phone',
  },
  {
    accessorKey: 'tipo',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('tipo') as string;
      return (
        <Badge variant={type === 'individual' ? 'outline' : 'secondary'}>
          {type}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const customer = row.original;

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

            {/* Editar Cliente */}
            <DropdownMenuItem
              onClick={() => {
                handleEditCustomer(customer.id); // Passe apenas o ID para buscar os dados completos
              }}
            >
              Edit
            </DropdownMenuItem>

            {/* Deletar Cliente */}
            <DropdownMenuItem
              onClick={() => {
                deleteCustomer(customer.id);
              }}
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
