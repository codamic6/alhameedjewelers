import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function OrderConfirmationPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-2xl text-center py-20">
        <CheckCircle2 className="mx-auto h-24 w-24 text-green-500" />
        <h1 className="text-4xl font-bold mt-4 text-primary">Thank You For Your Order!</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Your order has been placed successfully. You will receive an email confirmation shortly.
          We will contact you before delivery.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
