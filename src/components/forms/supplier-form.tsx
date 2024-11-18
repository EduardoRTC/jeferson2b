import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { z } from 'zod';

// Validação do formulário usando Zod
export const supplierSchema = z.object({
  nome: z.string().min(2, 'O nome é obrigatório'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
  contato: z.string().min(10, 'O contato é obrigatório'),
  endereco: z.string().min(5, 'O endereço é obrigatório'),
});

interface SupplierFormProps {
  onSuccess?: () => void;
  initialData?: z.infer<typeof supplierSchema> | null;
}

export function SupplierForm({ onSuccess, initialData }: SupplierFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      contato: '',
      endereco: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: z.infer<typeof supplierSchema>) => {
      const url = initialData
        ? `http://localhost:3000/fornecedores/${initialData.id}`
        : 'http://localhost:3000/fornecedores';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || `Failed to ${method === 'POST' ? 'create' : 'update'} supplier`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success(initialData ? 'Supplier updated successfully' : 'Supplier created successfully');
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to ${initialData ? 'update' : 'create'} supplier`);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
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
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contato"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
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
            ? 'Update Supplier'
            : 'Create Supplier'}
        </Button>
      </form>
    </Form>
  );
}
