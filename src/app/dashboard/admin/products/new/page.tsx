'use client';

import ProductForm from '../ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <PageTransition>
        <Card>
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Fill out the details for the new product.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductForm onFinished={() => router.push('/dashboard/admin/products')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
