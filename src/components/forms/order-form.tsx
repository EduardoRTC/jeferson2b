import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema } from '@/lib/validators';
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
import { z } from 'zod';

interface OrderFormProps {
  onSuccess?: () => void;
  initialData?: z.infer<typeof orderSchema>;
}

export function OrderForm({ onSuccess, initialData }: OrderFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData || {
      customerId: '',
      items: [],
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof orderSchema>) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add dynamic form fields for order items */}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Order'}
        </Button>
      </form>
    </Form>
  );
}