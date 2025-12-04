'use client';

import CouponForm from '../CouponForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';

export default function NewCouponPage() {
  const router = useRouter();

  return (
    <PageTransition>
        <Card>
            <CardHeader>
                <CardTitle>Add New Coupon</CardTitle>
                <CardDescription>Fill out the details for the new coupon.</CardDescription>
            </CardHeader>
            <CardContent>
                <CouponForm onFinished={() => router.push('/dashboard/admin/coupons')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
