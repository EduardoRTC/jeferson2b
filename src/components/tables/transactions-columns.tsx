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
    header: 'Data',
    cell: ({ row }) => {
      const date = row.getValue('data');
      return new Date(date).toLocaleDateString();
    },
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
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
    header: 'ID do Produto',
    cell: ({ row }) => {
      return `#${row.getValue('produtoId')}`;
    },
  },
  {
    accessorKey: 'pedidoId',
    header: 'ID do Pedido',
    cell: ({ row }) => {
      const orderId = row.getValue('pedidoId');
      return orderId ? `#${orderId}` : 'N/A';
    },
  },
  {
    accessorKey: 'valor',
    header: 'Valor',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('valor'));
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
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
      const queryClient = useQueryClient(); // Para atualizar os dados
      const [editOpen, setEditOpen] = useState(false);

      const deleteTransaction = async (id: number) => {
        try {
          const response = await fetch(`http://localhost:3000/transacoes/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Falha ao excluir a transação com ID ${id}`);
          }

          toast.success('Transação excluída com sucesso');
          queryClient.invalidateQueries(['transactions']); // Atualiza os dados
        } catch (error) {
          toast.error(`Erro ao excluir transação: ${error.message}`);
        }
      };

      return (
        <>
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
                  navigator.clipboard.writeText(transaction.id);
                  toast.success('ID da transação copiado');
                }}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>Editar Transação</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteTransaction(transaction.id)}
                className="text-red-600"
              >
                Excluir Transação
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Modal de Edição */}
          {editOpen && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Transação</DialogTitle>
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
