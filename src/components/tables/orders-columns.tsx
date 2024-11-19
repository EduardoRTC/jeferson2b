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
import { Badge } from '@/components/ui/badge';

export const columns: (
  handleEditOrder: (orderId: string) => void,
  deleteOrder: (id: string) => void
) => ColumnDef<any>[] = (handleEditOrder, deleteOrder) => [
  {
    accessorKey: 'id',
    header: 'ID do Pedido',
  },
  {
    accessorKey: 'customerName',
    header: 'Cliente',
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total'));
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount);
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'concluído'
              ? 'default'
              : status === 'processando'
              ? 'secondary'
              : status === 'pendente'
              ? 'outline'
              : 'destructive'
          }
        >
          {status === 'completed'
            ? 'Concluído'
            : status === 'processing'
            ? 'Processando'
            : status === 'pending'
            ? 'Pendente'
            : 'Cancelado'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'data',
    header: 'Data',
    cell: ({ row }) => {
      return new Date(row.getValue('data')).toLocaleDateString('pt-BR');
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;

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
            <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteOrder(order.id)}
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
