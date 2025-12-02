'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Package, ShoppingCart } from "lucide-react";
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Order, Product, UserProfile } from '@/lib/types';
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const { data: orders, isLoading: ordersLoading } = useCollection<Order>(
    firestore ? collection(firestore, 'orders') : null
  );
  
  const { data: products, isLoading: productsLoading } = useCollection<Product>(
    firestore ? collection(firestore, 'products') : null
  );

  const { data: customers, isLoading: customersLoading } = useCollection<UserProfile>(
    firestore ? collection(firestore, 'users') : null
  );

  const isLoading = ordersLoading || productsLoading || customersLoading;

  const totalRevenue = orders
    ?.filter(o => o.status === 'Delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0) ?? 0;
  const totalOrders = orders?.length ?? 0;
  const totalCustomers = customers?.length ?? 0;
  const totalProducts = products?.length ?? 0;

  if (isLoading) {
      return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
      <p className="text-muted-foreground">An overview of your store's performance.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Across all statuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total products in catalog</p>
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
          <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
              {/* A more advanced recent orders component would go here */}
              <p className="text-muted-foreground">Recent orders will be displayed here.</p>
          </CardContent>
      </Card>
    </div>
  );
}
