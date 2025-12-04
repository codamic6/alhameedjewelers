
"use client";

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2, ShoppingCart as ShoppingCartIcon, Loader2, TicketPercent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount, coupon, applyCoupon, removeCoupon, couponDiscount, totalAfterDiscount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCode);
    setIsApplyingCoupon(false);
    setCouponCode('');
  };


  if (cartCount === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto max-w-4xl text-center py-20">
          <ShoppingCartIcon className="mx-auto h-24 w-24 text-muted-foreground" />
          <h1 className="text-3xl font-bold mt-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mt-2 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">Your Shopping Cart</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map(({ product, quantity }) => {
              const image = PlaceHolderImages.find(p => p.id === (product.imageIds && product.imageIds[0]));
              return (
                <Card key={product.id} className="flex items-center p-4">
                  <div className="w-24 h-24 aspect-square rounded-md overflow-hidden mr-4 shrink-0">
                    {image && (
                      <Image
                        src={image.imageUrl}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                        data-ai-hint={image.imageHint}
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/products/${product.slug}`} className="font-semibold hover:text-primary">{product.name}</Link>
                      <p className="text-sm text-muted-foreground">${product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(product.id, quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-right font-semibold">${(product.price * quantity).toLocaleString()}</p>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => removeFromCart(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon">Have a coupon?</Label>
                  {coupon ? (
                     <div className="flex items-center justify-between rounded-md bg-secondary p-3 border border-dashed border-primary">
                        <div className="flex items-center gap-2">
                           <TicketPercent className="h-5 w-5 text-primary"/>
                           <span className="font-mono text-primary font-bold">{coupon.code}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={removeCoupon}>
                            <X className="h-4 w-4" />
                        </Button>
                     </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input 
                        id="coupon" 
                        placeholder="Coupon code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                      <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                        {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>
                <Separator className="my-4"/>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartTotal.toLocaleString()}</span>
                  </div>
                   {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
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
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
