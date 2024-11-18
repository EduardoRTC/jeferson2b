import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '@/lib/validators';
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

interface CustomerFormProps {
  onSuccess?: () => void;
  initialData?: z.infer<typeof customerSchema>;
}

export function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
  const queryClient = useQueryClient();

  // Configura o formulário com valores iniciais
  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.nome || '',
      document: initialData?.cpf_cnpj || '',
      email: initialData?.email || '',
      phone: initialData?.contato || '',
      address: initialData?.endereco || '',
      type: initialData?.tipo || 'individual',
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: z.infer<typeof customerSchema>) => {
      const payload = {
        nome: values.name,
        cpf_cnpj: values.document,
        email: values.email,
        contato: values.phone,
        endereco: values.address,
        tipo: values.type,
      };

      const url = initialData
        ? `http://localhost:3000/clientes/${initialData.id}`
        : 'http://localhost:3000/clientes';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.error || `Failed to ${method === 'POST' ? 'create' : 'update'} customer`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(
        initialData ? 'Customer updated successfully' : 'Customer created successfully'
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error(`Error ${initialData ? 'updating' : 'creating'} customer:`, error.message);
      toast.error(error.message || `Failed to ${initialData ? 'update' : 'create'} customer`);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document (CPF/CNPJ)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
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
            ? 'Update Customer'
            : 'Create Customer'}
        </Button>
      </form>
    </Form>
  );
}

