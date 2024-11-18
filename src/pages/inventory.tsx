import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/tables/inventory-columns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const lowStock = inventory?.filter(
    (item: any) => item.quantity <= item.minQuantity
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <p className="text-muted-foreground">
          Manage and track your inventory levels
        </p>
      </div>

      {lowStock?.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {lowStock.length} items are running low on stock
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {inventory
                ?.reduce(
                  (acc: number, item: any) =>
                    acc + item.quantity * item.price,
                  0
                )
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={inventory} searchKey="name" />
    </div>
  );
}