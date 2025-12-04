'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const checkoutSchema = z.object({
  firstName: z.string().min(2, { message: 'Please enter a valid first name.' }),
  lastName: z.string().min(2, { message: 'Please enter a valid last name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.'}),
  address: z.string().min(10, { message: 'Please enter a valid address.' }),
  city: z.string().min(3, { message: 'Please enter a city.' }),
  postalCode: z.string().min(4, { message: 'Please enter a valid postal code.' }),
  country: z.string().min(3, { message: 'Please enter a country.' }),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Pakistan',
    },
  });
  
   useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: '', // address fields are not in profile
        city: '',
        postalCode: '',
        country: 'Pakistan',
      });
    } else if (user) {
        form.reset({
            ...form.getValues(),
            email: user.email || '',
        });
    }
  }, [user, userProfile, form]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
    if (!isUserLoading && cartCount === 0) {
      router.replace('/cart');
    }
  }, [user, isUserLoading, cartCount, router]);

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to place an order.',
      });
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      userId: user.uid,
      orderDate: new Date().toISOString(),
      status: 'Pending' as const,
      totalAmount: cartTotal,
      shippingAddress: values,
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        itemPrice: item.product.price,
      })),
    };

    try {
      const docRef = await addDoc(collection(firestore, 'orders'), orderData);
      
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed.',
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

  if (isUserLoading || cartCount === 0 || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <Header />
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Payment will be collected on delivery (POD).</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Hassan" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Ali" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="hassan@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+92 300 1234567" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="House #123, Street 4" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Karachi" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="75500" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />

                        <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                            Place Order
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
            </div>
            <div className="space-y-4">
                <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map(({ product, quantity }) => {
                        const image = PlaceHolderImages.find(p => p.id === product.imageId);
                        return (
                            <div key={product.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                {image && (
                                    <Image
                                        src={image.imageUrl}
                                        alt={product.name}
                                        width={50}
                                        height={50}
                                        className="rounded-md object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                                </div>
                                </div>
                                <p className="font-semibold">${(product.price * quantity).toLocaleString()}</p>
                            </div>
                        )
                    })}
                </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between text-lg">
                        <span>Subtotal</span>
                        <span>${cartTotal.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between text-lg">
                        <span>Shipping</span>
                        <span>Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-2xl text-primary">
                        <span>Total</span>
                        <span>${cartTotal.toLocaleString()}</span>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
      </div>
    </PageTransition>
    <Footer />
    </>
  );
}
