import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderForm } from '@/components/forms/order-form';
import { columns } from '@/components/tables/orders-columns';
import { toast } from 'sonner';

export default function Orders() {
  const [open, setOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<any>(null);
  const queryClient = useQueryClient();

  // Buscar pedidos
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/pedidos');
      if (!res.ok) throw new Error('Falha ao buscar pedidos');
      const data = await res.json();
      console.log('Pedidos buscados:', data); // Log para depuração
      return data;
    },
  });

  // Buscar clientes
  const { data: customersData = [], isLoading: customersLoading } = useQuery({
    queryKey: ['validCustomers'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/clientes');
      if (!res.ok) throw new Error('Falha ao buscar clientes');
      const data = await res.json();
      return data.clientes || []; // Certifique-se de que o formato está correto
    },
  });

  // Combinar dados de pedidos com os nomes dos clientes
  const ordersWithCustomerNames =
    Array.isArray(orders?.pedidos) && Array.isArray(customersData)
      ? orders.pedidos.map((order: any) => {
          const customer = customersData.find(
            (cust: any) => cust.id === order.clienteId
          );
          return {
            ...order,
            customerName: customer?.nome || 'Desconhecido', // Use optional chaining para evitar erros
          };
        })
      : [];

  // Manipulador de edição de pedido
  const handleEditOrder = async (orderId: string) => {
    const order = orders.pedidos.find((o: any) => o.id === parseInt(orderId));
    if (!order) {
      console.error("Pedido não encontrado");
      return;
    }
  
    // Verificar se `items` é um array antes de calcular o total
    const total = Array.isArray(order.items)
      ? order.items.reduce(
          (sum: number, item: any) => sum + item.quantidade * item.precoUnitario,
          0
        )
      : 0;
  
    setEditOrder({ ...order, total }); // Atualiza o estado com o pedido selecionado e o total calculado
    setOpen(true); // Abre o modal de edição
  };

  // Manipulador de exclusão de pedido
  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/pedidos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Falha ao excluir pedido');
      queryClient.invalidateQueries(['orders']);
      toast.success('Pedido excluído com sucesso');
    } catch (error) {
      toast.error(`Falha ao excluir pedido: ${error.message}`);
    }
  };

  // Estado de carregamento
  if (ordersLoading || customersLoading) return <div>Carregando...</div>;

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pedido
        </Button>
      </div>
      <DataTable
        columns={columns(handleEditOrder, deleteOrder)}
        data={ordersWithCustomerNames} // Este array reflete o cache atualizado
        searchKey="customerName"
      />
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editOrder ? 'Editar Pedido' : 'Adicionar Pedido'}
              </DialogTitle>
            </DialogHeader>
            <OrderForm
              initialData={editOrder}
              onSuccess={() => {
                setOpen(false);
                setEditOrder(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
