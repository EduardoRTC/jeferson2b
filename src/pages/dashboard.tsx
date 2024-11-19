import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from 'recharts';

export default function Dashboard() {
  // Fetch transactions to calculate total revenue
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/transacoes');
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await res.json();
      return data.transacoes || [];
    },
  });

  // Fetch additional data for cards
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

  // Calculate total revenue
  const totalRevenue = transactions.reduce((total, transaction) => {
    return transaction.tipo === 'Entrada'
      ? total + transaction.valor
      : total - transaction.valor;
  }, 0);

  const totalProducts = productCountData?.totalProducts ?? 0;
  const totalCustomers = customerCountData?.totalCustomers ?? 0;

  // Prepare data for cumulative balance graph
  const cumulativeTransactions = transactions
    .map((transaction, index) => {
      const previousBalance =
        index === 0
          ? 0
          : transactions
              .slice(0, index)
              .reduce(
                (total, t) =>
                  t.tipo === 'Entrada'
                    ? total + t.valor
                    : total - t.valor,
                0
              );

      const newBalance =
        transaction.tipo === 'Entrada'
          ? previousBalance + transaction.valor
          : previousBalance - transaction.valor;

      return {
        data: transaction.data,
        saldo: newBalance,
      };
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

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
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(totalRevenue)}
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
            <LineChart data={cumulativeTransactions}>
              <XAxis
                dataKey="data"
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
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="currentColor"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
