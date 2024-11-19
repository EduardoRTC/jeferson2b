import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

interface TransactionFormProps {
  onSuccess?: () => void;
  initialData?: z.infer<typeof transactionSchema>;
}

export function TransactionForm({ onSuccess, initialData }: TransactionFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      tipo: 'Entrada', // Valor padrão
      valor: 0,
      data: '',
      produtoId: '',
      pedidoId: '',
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: z.infer<typeof transactionSchema>) => {
      const url = initialData
        ? `http://localhost:3000/transacoes/${initialData.id}`
        : 'http://localhost:3000/transacoes';
      const method = initialData ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Falha ao salvar transação');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      toast.success(`Transação ${initialData ? 'atualizada' : 'criada'} com sucesso`);
      onSuccess?.();
    },
    onError: () => {
      toast.error(`Falha ao ${initialData ? 'atualizar' : 'criar'} transação`);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de transação" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="produtoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Produto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pedidoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Pedido</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? initialData
              ? 'Atualizando...'
              : 'Criando...'
            : initialData
            ? 'Atualizar Transação'
            : 'Criar Transação'}
        </Button>
      </form>
    </Form>
  );
}
