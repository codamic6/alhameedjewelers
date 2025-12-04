'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import PageTransition from '@/components/PageTransition';

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
import { Loader2, ArrowRight } from 'lucide-react';
import CheckoutSteps from '../CheckoutSteps';

const shippingSchema = z.object({
  firstName: z.string().min(2, { message: 'Please enter a valid first name.' }),
  lastName: z.string().min(2, { message: 'Please enter a valid last name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.'}),
  address: z.string().min(10, { message: 'Please enter a valid address.' }),
  city: z.string().min(3, { message: 'Please enter a city.' }),
  postalCode: z.string().min(4, { message: 'Please enter a valid postal code.' }),
  country: z.string().min(3, { message: 'Please enter a country.' }),
});

export default function ShippingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { setCheckoutState, checkoutState, cartCount } = useCart();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<z.infer<typeof shippingSchema>>({
    resolver: zodResolver(shippingSchema),
    defaultValues: checkoutState.shippingAddress || {
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
    // Only pre-fill if the form hasn't been touched yet by the user
    if (Object.values(form.getValues()).every(v => !v) && (userProfile || user)) {
      form.reset({
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        email: user?.email || '',
        phone: userProfile?.phone || '',
        address: '', 
        city: '',
        postalCode: '',
        country: 'Pakistan',
      });
    }
  }, [user, userProfile, form]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/checkout/shipping');
    }
    if (!isUserLoading && cartCount === 0) {
      router.replace('/cart');
    }
  }, [user, isUserLoading, cartCount, router]);

  function onSubmit(values: z.infer<typeof shippingSchema>) {
    setCheckoutState({ shippingAddress: values });
    router.push('/checkout/payment');
  }

  if (isUserLoading || isProfileLoading || cartCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <CheckoutSteps currentStep={1} />
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter the address where you want to receive your order.</CardDescription>
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

                    <div className="flex justify-end pt-4">
                      <Button type="submit" size="lg" className="w-full md:w-auto">
                          Next: Payment
                          <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
