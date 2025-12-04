'use client';

import CouponForm from '../../CouponForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Coupon } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();

  const couponDocRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'coupons', id as string) : null),
    [firestore, id]
  );
  
  const { data: coupon, isLoading } = useDoc<Coupon>(couponDocRef);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  if (!coupon) {
    return <div>Coupon not found.</div>;
  }

  return (
    <PageTransition>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <CardTitle>Edit Coupon</CardTitle>
                        <CardDescription>Update the details for the coupon code "{coupon.code}".</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CouponForm coupon={coupon} onFinished={() => router.push('/dashboard/admin/coupons')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
