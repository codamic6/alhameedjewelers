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
import { MoreHorizontal, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, query } from 'firebase/firestore';
import { Order, OrderStatus, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import React from 'react';

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'orders')) : null),
    [firestore]
  );
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const isLoading = ordersLoading || usersLoading;

  const getBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    try {
      await updateDoc(orderRef, { status: status });
      toast({ title: 'Order Updated', description: `Order status changed to ${status}` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  const customerMap = useMemoFirebase(() => {
    if (!users) return new Map();
    return new Map(users.map(user => [user.id, `${user.firstName} ${user.lastName}`]));
  }, [users]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const OrderDetails = ({ order }: { order: Order }) => (
    <div className="bg-background/50 p-4 space-y-3">
        <h4 className="font-semibold text-sm text-primary">Order Items</h4>
        {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
                <div>
                    <p className="font-medium text-white">{item.productName}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-mono text-muted-foreground">${(item.itemPrice * item.quantity).toLocaleString()}</p>
            </div>
        ))}
         <Separator className="my-2"/>
         <div className="flex justify-end text-sm space-x-4 pr-1">
             <span>Subtotal:</span>
             <span className="font-semibold">${order.subTotal.toLocaleString()}</span>
         </div>
         {order.couponDiscount > 0 && (
             <div className="flex justify-end text-sm space-x-4 pr-1 text-green-400">
                <span>Discount ({order.couponCode}):</span>
                <span className="font-semibold">-${order.couponDiscount.toLocaleString()}</span>
            </div>
         )}
         <div className="flex justify-end font-bold text-base space-x-4 pr-1">
             <span>Total:</span>
             <span className="text-primary">${order.totalAmount.toLocaleString()}</span>
         </div>
    </div>
);


  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">Orders</h1>
      <p className="text-muted-foreground">
        View and manage all customer orders.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            A list of all orders from your customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Responsive Layout: Cards on mobile, Table on desktop */}
          <div className="md:hidden space-y-4">
            {orders?.map(order => (
              <Collapsible key={order.id} asChild>
                <Card>
                    <div className="flex items-center">
                        <div className="flex-1">
                             <CardHeader>
                                <CardTitle className="text-base">Order #{order.id.substring(0, 7)}</CardTitle>
                                <CardDescription>{new Date(order.orderDate).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm pb-4">
                                <p><span className="font-semibold text-muted-foreground">Customer:</span> {customerMap.get(order.userId) || 'N/A'}</p>
                                <p><span className="font-semibold text-muted-foreground">Total:</span> ${order.totalAmount.toLocaleString()}</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-muted-foreground">Status:</span>
                                    <Select
                                    value={order.status}
                                    onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                                    >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <Badge
                                        variant={getBadgeVariant(order.status)}
                                        className={cn(
                                            'w-full justify-center',
                                            order.status === 'Delivered' && 'bg-green-600/80 text-white',
                                            order.status === 'Shipped' && 'bg-blue-500/80 text-white',
                                            order.status === 'Pending' && 'text-yellow-400 border-yellow-400'
                                        )}
                                        >
                                        {order.status}
                                        </Badge>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </div>
                        <CollapsibleTrigger asChild>
                             <Button variant="ghost" className="mr-4">
                                <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                                <span className="sr-only">Toggle details</span>
                             </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                       <OrderDetails order={order} />
                    </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              {orders?.map(order => (
                <Collapsible asChild key={order.id}
                content={
                    <TableBody>
                         <TableRow>
                            <TableCell colSpan={6}>
                                <OrderDetails order={order} />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                }>
                    <TableBody>
                    <TableRow>
                        <TableCell>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
                                    <span className="sr-only">Toggle details</span>
                                </Button>
                            </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-medium">{order.id.substring(0, 7)}</TableCell>
                        <TableCell>{customerMap.get(order.userId) || 'N/A'}</TableCell>
                        <TableCell>
                        {new Date(order.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                        <Select
                            value={order.status}
                            onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                        >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                            <Badge
                                variant={getBadgeVariant(order.status)}
                                className={cn(
                                'w-full justify-center',
                                order.status === 'Delivered' && 'bg-green-600/80 text-white',
                                order.status === 'Shipped' && 'bg-blue-500/80 text-white',
                                order.status === 'Pending' && 'text-yellow-400 border-yellow-400'
                                )}
                            >
                                {order.status}
                            </Badge>
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        </TableCell>
                        <TableCell className="text-right">
                        ${order.totalAmount.toLocaleString()}
                        </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                       <TableRow>
                           <TableCell colSpan={6} className="p-0">
                               <OrderDetails order={order} />
                           </TableCell>
                       </TableRow>
                    </CollapsibleContent>
                    </TableBody>
              </Collapsible>
              ))}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
