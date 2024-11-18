import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CircleDollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  // Requisição para pegar o total de produtos
  const { data: productCountData } = useQuery({
    queryKey: ['dashboard-stats-product-count'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/dashboard/stats/productCount');
      if (!res.ok) {
        throw new Error('Failed to fetch product count');
      }
      return res.json();
    },
  });

  // Requisição para pegar o total de clientes
  const { data: customerCountData } = useQuery({
    queryKey: ['dashboard-stats-customer-count'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/dashboard/stats/customerCount');
      if (!res.ok) {
        throw new Error('Failed to fetch customer count');
      }
      return res.json();
    },
  });

  const totalProducts = productCountData?.totalProducts ?? 0;
  const totalCustomers = customerCountData?.totalCustomers ?? 0;

  const { data: salesData } = useQuery({
    queryKey: ['sales-overview'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/sales');
      return res.json();
    },
  });

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Add dynamic revenue data here */}
              $0
            </div>
          </CardContent>
        </Card>

        {/* Total Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{/* Orders count here */} 0</div>
          </CardContent>
        </Card>

        {/* Total Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
