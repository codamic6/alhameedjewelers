'use client';

import { useCart } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import CheckoutSteps from '../CheckoutSteps';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export default function PaymentPage() {
  const router = useRouter();
  const { setCheckoutState, checkoutState, cartCount } = useCart();
  const { user, isUserLoading } = useUser();
  const [paymentMethod, setPaymentMethod] = useState(
    checkoutState.paymentMethod || 'POD'
  );

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/checkout/shipping');
    }
    if (!isUserLoading && cartCount === 0) {
      router.replace('/cart');
    }
    if (!checkoutState.shippingAddress) {
        router.replace('/checkout/shipping');
    }
  }, [user, isUserLoading, cartCount, checkoutState.shippingAddress, router]);

  const handleSubmit = () => {
    setCheckoutState({ paymentMethod });
    router.push('/checkout/summary');
  };

  if (isUserLoading || !checkoutState.shippingAddress) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <CheckoutSteps currentStep={2} />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Select how you'd like to pay for your order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-4"
            >
              <Label
                htmlFor="pod"
                className={cn(
                    "flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:border-primary transition-colors",
                    paymentMethod === 'POD' && "border-primary ring-2 ring-primary"
                )}
              >
                <RadioGroupItem value="POD" id="pod" />
                <div>
                    <span className="font-semibold text-white">Payment on Delivery (POD)</span>
                    <p className="text-sm text-muted-foreground">Pay with cash when your order is delivered. (Currently available)</p>
                </div>
              </Label>
               <Label
                htmlFor="jazzcash"
                className="flex items-center gap-4 rounded-md border p-4 cursor-not-allowed opacity-50"
              >
                <RadioGroupItem value="JazzCash" id="jazzcash" disabled />
                <div>
                    <span className="font-semibold text-white">Jazz Cash</span>
                    <p className="text-sm text-muted-foreground">Coming soon.</p>
                </div>
              </Label>
               <Label
                htmlFor="easypaisa"
                className="flex items-center gap-4 rounded-md border p-4 cursor-not-allowed opacity-50"
              >
                <RadioGroupItem value="EasyPaisa" id="easypaisa" disabled />
                <div>
                    <span className="font-semibold text-white">Easy Paisa</span>
                    <p className="text-sm text-muted-foreground">Coming soon.</p>
                </div>
              </Label>
            </RadioGroup>
            <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between pt-6 mt-4 border-t">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="w-full md:w-auto"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto">
                Next: Order Summary
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
