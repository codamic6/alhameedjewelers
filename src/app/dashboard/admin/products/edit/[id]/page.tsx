
'use client';

import ProductForm from '../../ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();

  const productDocRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'products', id as string) : null),
    [firestore, id]
  );
  
  const { data: product, isLoading } = useDoc<Product>(productDocRef);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  if (!product) {
    return <div>Product not found.</div>;
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
                        <CardTitle>Edit Product</CardTitle>
                        <CardDescription>Update the details for "{product.name}".</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ProductForm product={product} onFinished={() => router.push('/dashboard/admin/products')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
