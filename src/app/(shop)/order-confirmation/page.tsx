'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const firestore = useFirestore();

  const orderDocRef = useMemoFirebase(
    () => (firestore && orderId ? doc(firestore, 'orders', orderId) : null),
    [firestore, orderId]
  );

  const { data: order, isLoading } = useDoc<Order>(orderDocRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-destructive">Order Not Found</h2>
        <p className="text-muted-foreground mt-2">We couldn't find the details for this order.</p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  const shipping = order.shippingAddress;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-4xl font-bold mt-4 text-primary">Thank You For Your Order!</h1>
        <p className="text-muted-foreground mt-2">
          Your order has been placed successfully. A confirmation will be sent to your email.
        </p>
        <p className="text-sm text-muted-foreground mt-1">Order ID: <span className="font-mono text-primary">{order.id}</span></p>
      </div>

      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(item.itemPrice * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${order.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
              <p className="font-semibold">{shipping.firstName} {shipping.lastName}</p>
              <p>{shipping.address}</p>
              <p>{shipping.city}, {shipping.postalCode}</p>
              <p>{shipping.country}</p>
              <p>Email: {shipping.email}</p>
              <p>Phone: {shipping.phone}</p>
          </CardContent>
      </Card>

      <div className="flex justify-center gap-4 pt-4">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">View My Orders</Link>
        </Button>
      </div>
    </div>
  );
}


export default function OrderConfirmationPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-2xl py-12 md:py-20">
         <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <OrderConfirmationContent />
        </Suspense>
      </div>
    </PageTransition>
  );
}
