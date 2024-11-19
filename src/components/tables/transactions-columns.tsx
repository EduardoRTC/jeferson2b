import { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import { TransactionForm } from '@/components/forms/transaction-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'data',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('data');
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: 'tipo',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('tipo') as string;
      return (
        <Badge variant={type === 'Entrada' ? 'default' : 'destructive'}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'produtoId',
    header: 'Product ID',
    cell: ({ row }) => {
      return `#${row.getValue('produtoId')}`;
    },
  },
  {
    accessorKey: 'pedidoId',
    header: 'Order ID',
    cell: ({ row }) => {
      const orderId = row.getValue('pedidoId');
      return orderId ? `#${orderId}` : 'N/A';
    },
  },
  {
    accessorKey: 'valor',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('valor'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return (
        <div className={row.original.tipo === 'Saída' ? 'text-red-500' : 'text-green-500'}>
          {row.original.tipo === 'Saída' ? '- ' : '+ '}
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const transaction = row.original;
      const queryClient = useQueryClient(); // Utilizado para invalidação de cache
      const [editOpen, setEditOpen] = useState(false);

      const deleteTransaction = async (id: number) => {
        try {
          const response = await fetch(`http://localhost:3000/transacoes/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Failed to delete transaction with ID ${id}`);
          }

          toast.success('Transaction deleted successfully');

          // Invalida a query para atualizar automaticamente os dados
          queryClient.invalidateQueries(['transactions']);
        } catch (error) {
          toast.error(`Error deleting transaction: ${error.message}`);
        }
      };

      return (
        <>
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
                  navigator.clipboard.writeText(transaction.id);
                  toast.success('Transaction ID copied to clipboard');
                }}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit Transaction</DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteTransaction(transaction.id)}>
                Delete Transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Modal de Edição */}
          {editOpen && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm
                  initialData={transaction} // Envia os dados da transação para o formulário
                  onSuccess={() => {
                    setEditOpen(false);
                    queryClient.invalidateQueries(['transactions']); // Atualiza os dados após editar
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      );
    },
  },
];
