'use client';

import ProductForm from '../ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {
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
                        <CardTitle>Add New Product</CardTitle>
                        <CardDescription>Fill out the details for the new product.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ProductForm onFinished={() => router.push('/dashboard/admin/products')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
