
'use client';

import { useCart } from '@/hooks/use-cart';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import CheckoutSteps from '../CheckoutSteps';
import { Separator } from '@/components/ui/separator';
import { placeOrder as placeOrderAction } from '@/lib/actions';
import type { Order } from '@/lib/types';


export default function SummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { cartItems, clearCart, checkoutState, cartCount, cartTotal, coupon, couponDiscount, totalAfterDiscount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(0); // Placeholder for shipping cost

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/checkout/shipping');
    }
     if (!isUserLoading && cartCount === 0) {
      router.replace('/cart');
    }
    if (!checkoutState.shippingAddress || !checkoutState.paymentMethod) {
      router.replace('/checkout/shipping');
    }
    // In a real app, you would fetch shipping cost based on checkoutState.shippingAddress.city
    // For now, we'll keep it simple.
    if(checkoutState.shippingAddress) {
        // Mock shipping cost logic
        const city = checkoutState.shippingAddress.city.toLowerCase();
        if (city === 'karachi' || city === 'lahore' || city === 'islamabad') {
            setShippingCost(250);
        } else {
            setShippingCost(400);
        }
    }
  }, [user, isUserLoading, checkoutState, cartCount, router]);

  async function handlePlaceOrder() {
    if (!user || !checkoutState.shippingAddress || !checkoutState.paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing required information. Please start checkout again.',
      });
      return;
    }

    setIsSubmitting(true);
    const finalTotal = totalAfterDiscount + shippingCost;

    const orderData: Omit<Order, 'id' | 'orderDate'> = {
      userId: user.uid,
      status: 'Pending',
      subTotal: cartTotal,
      shippingCost: shippingCost,
      couponCode: coupon?.code || null,
      couponDiscount: couponDiscount,
      totalAmount: finalTotal,
      shippingAddress: checkoutState.shippingAddress,
      paymentMethod: checkoutState.paymentMethod,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        itemPrice: item.product.price,
      })),
    };

    try {
      const result = await placeOrderAction(orderData, coupon);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed.',
        className: 'bg-green-600 border-green-600 text-white',
        icon: <CheckCircle className="h-5 w-5" />
      });
      
      clearCart();
      router.push(`/order-confirmation?orderId=${result.orderId}`);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not place your order.',
      });
      setIsSubmitting(false);
    }
  }

  const { shippingAddress, paymentMethod } = checkoutState;
  
  if (isUserLoading || !shippingAddress || !paymentMethod) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const finalTotal = totalAfterDiscount + shippingCost;

  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <CheckoutSteps currentStep={3} />
        <div className="grid lg:grid-cols-2 gap-8 items-start mt-8">
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Shipping To</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p className="font-semibold text-white">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                        <p>{shippingAddress.address}</p>
                        <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                        <Separator className="my-2"/>
                        <p>Email: {shippingAddress.email}</p>
                        <p>Phone: {shippingAddress.phone}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p className="font-semibold text-white">Payment on Delivery (POD)</p>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {cartItems.map(({ product, quantity }) => {
                            const image = product.imageUrls && product.imageUrls[0];
                            return (
                                <div key={product.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                    {image && (
                                        <Image
                                            src={image}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded-md object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-semibold text-white">{product.name}</p>
                                        <p className="text-muted-foreground">Qty: {quantity}</p>
                                    </div>
                                    </div>
                                    <p className="font-semibold">PKR {(product.price * quantity).toLocaleString()}</p>
                                </div>
                            )
                        })}
                         <Separator className="my-2 !mt-4"/>
                         <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>PKR {cartTotal.toLocaleString()}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount ({coupon?.code})</span>
                            <span>-PKR {couponDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>PKR {shippingCost.toLocaleString()}</span>
                        </div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold text-lg text-primary">
                            <span>Total</span>
                            <span>PKR {finalTotal.toLocaleString()}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 items-stretch">
                         <Button onClick={handlePlaceOrder} size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                            Confirm & Place Order
                        </Button>
                         <Button
                            variant="outline"
                            size="lg"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Payment
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
