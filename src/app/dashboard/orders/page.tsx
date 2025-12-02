import { orders, Order } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const userOrders = orders; // Mock: In a real app, filter for the logged-in user

  const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">My Orders</h1>
      <p className="text-muted-foreground">View your past orders and their status.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(order.status)} className={cn(
                        order.status === 'Delivered' && 'bg-green-600/80 text-white',
                        order.status === 'Shipped' && 'bg-blue-500/80 text-white',
                        order.status === 'Pending' && 'text-yellow-400 border-yellow-400'
                    )}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell className="text-right">${order.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
