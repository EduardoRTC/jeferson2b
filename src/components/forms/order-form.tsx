import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect } from "react";

// Schema de validação do formulário
const orderSchema = z.object({
  clienteId: z.number().min(1, "Customer is required"),
  status: z.string().min(1, "Status is required"),
  items: z
    .array(
      z.object({
        produtoId: z.number().min(1, "Product is required"),
        quantidade: z.number().min(1, "Quantity is required"),
        precoUnitario: z.number().min(0.01, "Unit price is required"),
      })
    )
    .min(1, "At least one item is required"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
  initialData?: Partial<OrderFormData & { id: number }>;
}

export function OrderForm({ onSuccess, initialData }: OrderFormProps) {
  const queryClient = useQueryClient();

  // Log de depuração para verificar o `initialData`
  useEffect(() => {
    console.log("Initial Data for Editing:", initialData);
  }, [initialData]);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: initialData || {
      clienteId: 0,
      status: "",
      items: [{ produtoId: 0, quantidade: 1, precoUnitario: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch valid customers
  const { data: validCustomers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["validCustomers"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/clientes");
      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await res.json();
      return data.clientes || [];
    },
  });

  // Fetch valid products
  const { data: validProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["validProducts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/products");
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      return data || [];
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: OrderFormData) => {
      const url = initialData
        ? `http://localhost:3000/pedidos/${initialData.id}`
        : 'http://localhost:3000/pedidos';
      const method = initialData ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok)
        throw new Error(`Failed to ${initialData ? 'update' : 'create'} order`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']); // Invalida a query ao salvar
      toast.success(`Order ${initialData ? 'updated' : 'created'} successfully`);
      form.reset();
      onSuccess?.(); // Fecha o modal e redefine o formulário
    },
    onError: (error) => {
      toast.error(
        `Failed to ${initialData ? 'update' : 'create'} order: ${error}`
      );
    },
  });
  
  
  
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const calculatedTotal = data.items.reduce(
            (acc, item) => acc + item.quantidade * item.precoUnitario,
            0
          );
        
          const valuesToSubmit = {
            ...data,
            total: calculatedTotal, // Inclui o total no objeto enviado
          };
        
          console.log("Data to submit:", valuesToSubmit); // Confirme que o total está correto
          mutate(valuesToSubmit);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="clienteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCustomers ? (
                      <SelectItem key="loading" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : validCustomers.length > 0 ? (
                      validCustomers.map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={customer.id.toString()}
                        >
                          {customer.nome}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="no-customers" disabled>
                        No customers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter order status" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fields.map((field, index) => {
          const selectedProduct = validProducts.find(
            (product: any) =>
              product.id === form.getValues(`items.${index}.produtoId`)
          );

          return (
            <div key={field.id} className="flex gap-4">
              <FormField
                control={form.control}
                name={`items.${index}.produtoId`}
                render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          const selected = validProducts.find(
                            (product: any) => product.id === Number(value)
                          );
                          if (selected) {
                            form.setValue(
                              `items.${index}.precoUnitario`,
                              selected.preco
                            );
                          }
                        }}
                        value={field.value?.toString() || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingProducts ? (
                            <SelectItem key="loading" disabled>
                              Loading products...
                            </SelectItem>
                          ) : validProducts.length > 0 ? (
                            validProducts.map((product: any) => (
                              <SelectItem
                                key={product.id}
                                value={product.id.toString()}
                              >
                                {product.nome}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-products" disabled>
                              No products available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.quantidade`}
                render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>Quantity</FormLabel>
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
              <FormItem className="w-1/3">
                <FormLabel>Unit Price</FormLabel>
                <div className="mt-2">
                  {selectedProduct?.preco ? `$${selectedProduct.preco}` : "N/A"}
                </div>
              </FormItem>
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          onClick={() =>
            append({ produtoId: 0, quantidade: 1, precoUnitario: 0 })
          }
        >
          Add Item
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update Order"
            : "Create Order"}
        </Button>
      </form>
    </Form>
  );
}
