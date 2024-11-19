import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validators';
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
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { z } from 'zod';

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: z.infer<typeof productSchema> | null;
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const queryClient = useQueryClient();

  // Configura o formulário com valores iniciais
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      preco: 0,
      quantidade: 0,
      imagem: '',
    },
  });

  // Atualiza os valores do formulário quando `initialData` muda
  useEffect(() => {
    if (initialData) {
      form.reset({
        nome: initialData.nome || '',
        descricao: initialData.descricao || '',
        preco: initialData.preco || 0,
        quantidade: initialData.quantidade || 0,
        imagem: initialData.imagem || '',
      });
    }
  }, [initialData, form]);

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: z.infer<typeof productSchema>) => {
      const payload = {
        nome: values.nome,
        descricao: values.descricao,
        preco: values.preco,
        quantidade: values.quantidade,
        imagem: values.imagem,
      };

      const url = initialData
        ? `http://localhost:3000/products/${initialData.id}`
        : 'http://localhost:3000/products';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || `Falha ao ${method === 'POST' ? 'criar' : 'atualizar'} produto`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        initialData ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso'
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error(`Erro ao ${initialData ? 'atualizar' : 'criar'} produto:`, error.message);
      toast.error(error.message || `Falha ao ${initialData ? 'atualizar' : 'criar'} produto`);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          console.log('Dados enviados pelo formulário:', data);
          mutate(data);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input {...field} />
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
            ? 'Atualizar Produto'
            : 'Criar Produto'}
        </Button>
      </form>
    </Form>
  );
}
