'use client';

import CouponForm from '../CouponForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft } from 'lucide-react';

export default function NewCouponPage() {
  const router = useRouter();

  return (
    <PageTransition>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <CardTitle>Add New Coupon</CardTitle>
                        <CardDescription>Fill out the details for the new coupon.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CouponForm onFinished={() => router.push('/dashboard/admin/coupons')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
