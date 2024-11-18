import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Product',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'quantity',
    header: 'Stock',
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      const minQuantity = row.original.minQuantity as number;

      return (
        <div className="flex items-center gap-2">
          {quantity}
          {quantity <= minQuantity && (
            <Badge variant="destructive">Low Stock</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Unit Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    },
  },
  {
    id: 'value',
    header: 'Total Value',
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      const price = parseFloat(row.getValue('price'));
      const total = quantity * price;

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total);
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
            <DropdownMenuItem>View History</DropdownMenuItem>
            <DropdownMenuItem>Edit Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];