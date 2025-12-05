'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, Users, Package, Activity, ShoppingBag } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Order, Product, UserProfile } from '@/lib/types';
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// Main dashboard component for the admin panel.
export default function AdminDashboardPage() {
  const firestore = useFirestore();

  // Data Hooks
  const ordersCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'orders') : null),
    [firestore]
  );
  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersCollection);
  
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);

  const customersCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: customers, isLoading: customersLoading } = useCollection<UserProfile>(customersCollection);

  const recentOrdersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(5)) : null),
    [firestore]
  );
  const { data: recentOrders, isLoading: recentOrdersLoading } = useCollection<Order>(recentOrdersQuery);


  const isLoading = ordersLoading || productsLoading || customersLoading || recentOrdersLoading;

  // Calculations
  const totalRevenue = orders
    ?.filter(o => o.status === 'Delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0) ?? 0;
  const totalOrders = orders?.length ?? 0;
  const totalCustomers = customers?.length ?? 0;
  const totalProducts = products?.length ?? 0;

  // Helper function to safely convert orderDate to a Date object
  const getOrderDate = (orderDate: Timestamp | string | Date): Date => {
    if (orderDate instanceof Timestamp) {
      return orderDate.toDate();
    }
    if (orderDate instanceof Date) {
        return orderDate;
    }
    const date = new Date(orderDate);
    return isNaN(date.getTime()) ? new Date() : date;
  };


  if (isLoading) {
      return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">An overview of your store's performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total items in catalog</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
           <CardHeader className="flex flex-row items-center">
             <div className="grid gap-2">
               <CardTitle className="text-primary">Recent Orders</CardTitle>
               <CardDescription>You have {totalOrders} total orders.</CardDescription>
             </div>
             <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/admin/orders">View All <ArrowUpRight className="h-4 w-4"/></Link>
             </Button>
           </CardHeader>
           <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentOrders?.map(order => {
                        const customer = customers?.find(c => c.id === order.userId);
                        return (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <div className="font-medium">{customer ? `${customer.firstName} ${customer.lastName}` : 'N/A'}</div>
                                    <div className="hidden text-sm text-muted-foreground md:inline">{customer?.email}</div>
                                </TableCell>
                                <TableCell>{formatDistanceToNow(getOrderDate(order.orderDate), { addSuffix: true })}</TableCell>
                                <TableCell className="text-right">PKR {order.totalAmount.toLocaleString()}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
             </Table>
           </CardContent>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="text-primary">Recent Customers</CardTitle>
                <CardDescription>You have {totalCustomers} customers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
                {customers?.slice(0,5).map(customer => (
                    <div key={customer.id} className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                           <AvatarFallback>{customer.firstName[0]}{customer.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{customer.firstName} {customer.lastName}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
