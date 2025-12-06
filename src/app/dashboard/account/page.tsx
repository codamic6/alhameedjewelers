

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';


const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  phone: z.string().regex(/^\+92\d{10}$/, 'Phone number must be in the format +92XXXXXXXXXX.'),
  address: z.string().min(10, { message: 'Please enter a valid address.' }).optional().or(z.literal('')),
  city: z.string().min(3, { message: 'Please enter a city.' }).optional().or(z.literal('')),
  postalCode: z.string().min(4, { message: 'Please enter a valid postal code.' }).optional().or(z.literal('')),
});


export default function AccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent requests until user is loaded
  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '+92',
      address: '',
      city: '',
      postalCode: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '+92',
        address: userProfile.address || '',
        city: userProfile.city || '',
        postalCode: userProfile.postalCode || '',
      });
    }
  }, [userProfile, form]);
  

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }

    setIsSubmitting(true);

    const updatedProfile = {
      id: user.uid,
      email: user.email,
      ...values,
    };

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, updatedProfile, { merge: true });
      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not update your profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const isLoading = isUserLoading || (user && isProfileLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-primary">My Account</h1>
      <p className="text-muted-foreground">Manage your account settings and preferences.</p>

      <div className="mt-6 grid gap-6">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>
                 <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+923001234567" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="House #123, Street 4" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Karachi" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => ( <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="75500" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                   {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
