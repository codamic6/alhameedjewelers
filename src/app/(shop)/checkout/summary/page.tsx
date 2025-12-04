
'use client';

import { useCart } from '@/hooks/use-cart';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import CheckoutSteps from '../CheckoutSteps';
import { Separator } from '@/components/ui/separator';

export default function SummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { cartItems, clearCart, checkoutState, cartCount, cartTotal, coupon, couponDiscount, totalAfterDiscount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [user, isUserLoading, checkoutState, cartCount, router]);

  async function placeOrder() {
    if (!user || !firestore || !checkoutState.shippingAddress || !checkoutState.paymentMethod) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing required information. Please start checkout again.',
      });
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      userId: user.uid,
      orderDate: serverTimestamp(),
      status: 'Pending' as const,
      subTotal: cartTotal,
      couponCode: coupon?.code || null,
      couponDiscount: couponDiscount,
      totalAmount: totalAfterDiscount,
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
      // Increment coupon usage if a coupon was applied
      if (coupon) {
          const couponRef = doc(firestore, 'coupons', coupon.id);
          await updateDoc(couponRef, {
              timesUsed: increment(1)
          });
      }

      const ordersRef = collection(firestore, 'orders'); // Placing orders in a top-level collection now
      const docRef = await addDoc(ordersRef, orderData);
      
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed.',
        className: 'bg-green-600 border-green-600 text-white',
        icon: <CheckCircle className="h-5 w-5" />
      });
      
      clearCart();
      router.push(`/order-confirmation?orderId=${docRef.id}`);

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
                            const image = PlaceHolderImages.find(p => p.id === product.imageId);
                            return (
                                <div key={product.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                    {image && (
                                        <Image
                                            src={image.imageUrl}
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
                                    <p className="font-semibold">${(product.price * quantity).toLocaleString()}</p>
                                </div>
                            )
                        })}
                         <Separator className="my-2 !mt-4"/>
                         <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${cartTotal.toLocaleString()}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount ({coupon?.code})</span>
                            <span>-${couponDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold text-lg text-primary">
                            <span>Total</span>
                            <span>${totalAfterDiscount.toLocaleString()}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 items-stretch">
                         <Button onClick={placeOrder} size="lg" className="w-full" disabled={isSubmitting}>
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

    