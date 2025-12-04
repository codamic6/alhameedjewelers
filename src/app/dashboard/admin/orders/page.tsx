
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
import { MoreHorizontal, Loader2, ChevronDown, User, Truck, CreditCard } from 'lucide-react';
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
import { collection, doc, updateDoc, query, Timestamp } from 'firebase/firestore';
import { Order, OrderStatus, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import React, { useMemo, useState } from 'react';

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
  
  const customerMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map(user => [user.id, `${user.firstName} ${user.lastName}`]));
  }, [users]);

  const getOrderDate = (order: Order) => {
      if (order.orderDate instanceof Timestamp) {
          return order.orderDate.toDate();
      }
      // Handle cases where orderDate might be a string if not converted
      const date = new Date(order.orderDate);
      return isNaN(date.getTime()) ? new Date() : date;
  }

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(currentId => currentId === orderId ? null : orderId);
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const OrderDetails = ({ order }: { order: Order }) => {
    const shipping = order.shippingAddress;
    return (
        <div className="bg-background/50 p-4 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                 {/* Shipping Details */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-2"><Truck className="h-4 w-4"/> Shipping To</h4>
                    {shipping ? (
                        <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">
                            <p className="font-semibold text-white">{shipping.firstName} {shipping.lastName}</p>
                            <p>{shipping.address}, {shipping.city}, {shipping.postalCode}</p>
                            <p>{shipping.country}</p>
                            <Separator className="my-2"/>
                            <p>Email: {shipping.email}</p>
                            <p>Phone: {shipping.phone}</p>
                        </div>
                    ) : <p>No shipping address available.</p>}
                </div>
                 {/* Order Items */}
                <div className="space-y-3">
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
                </div>
            </div>
             <Separator className="my-4"/>
             <div className="grid md:grid-cols-2 gap-6">
                  {/* Payment Method */}
                 <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-2"><CreditCard className="h-4 w-4"/> Payment Method</h4>
                    <div className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-md">
                        <p className="font-semibold text-white">{order.paymentMethod}</p>
                        <p>Payment to be collected upon delivery.</p>
                    </div>
                </div>
                {/* Totals */}
                <div className="space-y-2 text-sm">
                     <div className="flex justify-between items-center">
                         <span>Subtotal:</span>
                         <span className="font-semibold">${order.subTotal.toLocaleString()}</span>
                     </div>
                     {order.couponDiscount > 0 && (
                         <div className="flex justify-between items-center text-green-400">
                            <span>Discount ({order.couponCode}):</span>
                            <span className="font-semibold">-${order.couponDiscount.toLocaleString()}</span>
                        </div>
                     )}
                     <Separator className="my-2"/>
                     <div className="flex justify-between items-center font-bold text-base">
                         <span>Grand Total:</span>
                         <span className="text-primary">${order.totalAmount.toLocaleString()}</span>
                     </div>
                </div>
             </div>
        </div>
    );
  };


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
              <Card key={order.id} className="overflow-hidden">
                    <div className="flex items-start p-4">
                        <div className="flex-1 space-y-3">
                            <div>
                                <CardTitle className="text-lg">Order #{order.id.substring(0, 7)}</CardTitle>
                                <CardDescription>{getOrderDate(order).toLocaleDateString()}</CardDescription>
                            </div>
                            <div className="text-sm space-y-1">
                                <p className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4"/> {customerMap.get(order.userId) || 'N/A'}</p>
                                <p className="font-semibold text-white">Total: ${order.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-muted-foreground text-sm">Status:</span>
                                <Select
                                value={order.status}
                                onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                                >
                                <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-none focus:ring-0 shadow-none">
                                    <Badge
                                    variant={getBadgeVariant(order.status)}
                                    className={cn(
                                        'justify-center',
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
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => toggleOrderDetails(order.id)}>
                            <ChevronDown className={cn("h-5 w-5 transition-transform", expandedOrderId === order.id && "rotate-180")} />
                            <span className="sr-only">Toggle details</span>
                         </Button>
                    </div>
                    {expandedOrderId === order.id && <OrderDetails order={order} />}
                </Card>
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
              <TableBody>
              {orders?.map(order => (
                    <React.Fragment key={order.id}>
                        <TableRow className={cn(expandedOrderId === order.id && "border-b-0")}>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => toggleOrderDetails(order.id)}>
                                    <ChevronDown className={cn("h-5 w-5 transition-transform", expandedOrderId === order.id && "rotate-180")} />
                                    <span className="sr-only">Toggle details for order {order.id}</span>
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium">{order.id.substring(0, 7)}</TableCell>
                            <TableCell>{customerMap.get(order.userId) || 'N/A'}</TableCell>
                            <TableCell>
                                {getOrderDate(order).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                            <Select
                                value={order.status}
                                onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                            >
                                <SelectTrigger className="w-auto h-auto p-0 bg-transparent border-none focus:ring-0 shadow-none">
                                <Badge
                                    variant={getBadgeVariant(order.status)}
                                    className={cn(
                                    'justify-center',
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
                         {expandedOrderId === order.id && (
                          <TableRow className="bg-background hover:bg-background">
                            <TableCell colSpan={6} className="p-0">
                                <OrderDetails order={order} />
                            </TableCell>
                          </TableRow>
                        )}
                    </React.Fragment>
              ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
