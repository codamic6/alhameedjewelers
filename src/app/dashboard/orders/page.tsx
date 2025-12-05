'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'orders'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: userOrders, isLoading } = useCollection<Order>(userOrdersQuery);

  const getBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'default';
      case 'Shipped':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        My Orders
      </h1>
      <p className="text-muted-foreground">
        View your past orders and their status.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Mobile View: Card List */}
              <div className="md:hidden space-y-4">
                {userOrders?.map(order => (
                  <Card key={order.id} className="bg-secondary/50">
                    <CardHeader>
                      <CardTitle className="text-base flex justify-between">
                        <span>Order ID</span>
                        <span className="font-mono text-sm text-muted-foreground">{order.id.substring(0, 7)}...</span>
                      </CardTitle>
                      <CardDescription>{new Date(order.orderDate).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                       <div className="flex justify-between items-center">
                         <span className="text-muted-foreground">Status</span>
                         <Badge
                            variant={getBadgeVariant(order.status)}
                            className={cn(
                              order.status === 'Delivered' && 'bg-green-600/80 text-white',
                              order.status === 'Shipped' && 'bg-blue-500/80 text-white',
                              order.status === 'Pending' && 'text-yellow-400 border-yellow-400'
                            )}
                          >
                            {order.status}
                          </Badge>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-muted-foreground">Total</span>
                         <span className="font-semibold text-white">PKR {order.totalAmount.toLocaleString()}</span>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userOrders?.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                        <TableCell>
                          {new Date(order.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getBadgeVariant(order.status)}
                            className={cn(
                              order.status === 'Delivered' &&
                                'bg-green-600/80 text-white',
                              order.status === 'Shipped' &&
                                'bg-blue-500/80 text-white',
                              order.status === 'Pending' &&
                                'text-yellow-400 border-yellow-400'
                            )}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          PKR {order.totalAmount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
