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
  clienteId: z.number().min(1, "Cliente é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  items: z
    .array(
      z.object({
        produtoId: z.number().min(1, "Produto é obrigatório"),
        quantidade: z.number().min(1, "Quantidade é obrigatória"),
        precoUnitario: z.number().min(0.01, "Preço unitário é obrigatório"),
      })
    )
    .min(1, "Pelo menos um item é obrigatório"),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
  initialData?: Partial<OrderFormData & { id: number }>;
}

export function OrderForm({ onSuccess, initialData }: OrderFormProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Dados iniciais para edição:", initialData);
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

  const { data: validCustomers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["validCustomers"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/clientes");
      if (!res.ok) {
        throw new Error("Falha ao buscar clientes");
      }
      const data = await res.json();
      return data.clientes || [];
    },
  });

  const { data: validProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["validProducts"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/products");
      if (!res.ok) {
        throw new Error("Falha ao buscar produtos");
      }
      const data = await res.json();
      return data || [];
    },
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: async (values: OrderFormData) => {
      const url = initialData
        ? `http://localhost:3000/pedidos/${initialData.id}`
        : "http://localhost:3000/pedidos";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok)
        throw new Error(`Falha ao ${initialData ? "atualizar" : "criar"} pedido`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      toast.success(
        `Pedido ${initialData ? "atualizado" : "criado"} com sucesso`
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(
        `Falha ao ${initialData ? "atualizar" : "criar"} pedido: ${error}`
      );
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const totalCalculado = data.items.reduce(
            (acc, item) => acc + item.quantidade * item.precoUnitario,
            0
          );

          const valoresParaSubmissao = {
            ...data,
            total: totalCalculado,
          };

          console.log("Dados para submissão:", valoresParaSubmissao);
          mutate(valoresParaSubmissao);
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="clienteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCustomers ? (
                      <SelectItem key="loading" disabled>
                        Carregando clientes...
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
                        Nenhum cliente disponível
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
                <Input {...field} placeholder="Insira o status do pedido" />
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
                    <FormLabel>Produto</FormLabel>
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
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingProducts ? (
                            <SelectItem key="loading" disabled>
                              Carregando produtos...
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
                              Nenhum produto disponível
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
                    <FormLabel>Quantidade</FormLabel>
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
                <FormLabel>Preço Unitário</FormLabel>
                <div className="mt-2">
                  {selectedProduct?.preco
                    ? `R$ ${selectedProduct.preco}`
                    : "N/A"}
                </div>
              </FormItem>
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remover
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
          Adicionar Item
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? initialData
              ? "Atualizando..."
              : "Criando..."
            : initialData
            ? "Atualizar Pedido"
            : "Criar Pedido"}
        </Button>
      </form>
    </Form>
  );
}
