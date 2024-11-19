import { cn } from '@/lib/utils';
import {
  Box,
  CircleDollarSign,
  Home,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routes = [
  {
    label: 'Visão Geral',
    icon: Home,
    href: '/',
    color: 'text-sky-500',
  },
  {
    label: 'Produtos',
    icon: Package,
    href: '/produtos',
    color: 'text-violet-500',
  },
  {
    label: 'Pedidos',
    icon: ShoppingCart,
    color: 'text-pink-700',
    href: '/pedidos',
  },
  {
    label: 'Clientes',
    icon: Users,
    color: 'text-orange-700',
    href: '/clientes',
  },
  {
    label: 'Fornecedores',
    icon: Truck,
    color: 'text-green-700',
    href: '/fornecedores',
  },
  {
    label: 'Transações',
    icon: CircleDollarSign,
    color: 'text-emerald-500',
    href: '/transacoes',
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                location.pathname === route.href
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
