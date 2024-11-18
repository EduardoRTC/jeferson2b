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
        throw new Error(errorDetails.error || `Failed to ${method === 'POST' ? 'create' : 'update'} product`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        initialData ? 'Product updated successfully' : 'Product created successfully'
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error(`Error ${initialData ? 'updating' : 'creating'} product:`, error.message);
      toast.error(error.message || `Failed to ${initialData ? 'update' : 'create'} product`);
    },
  });

  return (
    <Form {...form}>
      <form
  onSubmit={form.handleSubmit((data) => {
    console.log('Form data submitted:', data); // Log dos dados do formulário
    mutate(data); // Envia os dados para o backend
  })}
  className="space-y-4"
>
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
              <FormLabel>Description</FormLabel>
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
              <FormLabel>Price</FormLabel>
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
              <FormLabel>Quantity</FormLabel>
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
              <FormLabel>Image URL</FormLabel>
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
              ? 'Updating...'
              : 'Creating...'
            : initialData
            ? 'Update Product'
            : 'Create Product'}
        </Button>
      </form>
    </Form>
  );
}
