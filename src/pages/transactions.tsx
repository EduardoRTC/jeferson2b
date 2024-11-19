import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionForm } from '@/components/forms/transaction-form';
import { columns } from '@/components/tables/transactions-columns';

export default function Transactions() {
  const [open, setOpen] = useState(false);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/transacoes');
      if (!res.ok) {
        throw new Error('Falha ao buscar transações');
      }
      const data = await res.json();
      console.log('Transações carregadas:', data); // Log para depuração
      return data.transacoes; // Certifique-se de acessar a propriedade correta
    },
  });
  
  if (isLoading) return <div>Carregando...</div>;
  if (!transactions.length) return <div>Nenhuma transação encontrada</div>;

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={transactions} searchKey="description" />
    </div>
  );
}
