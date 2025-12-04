'use client';

import ProductForm from '../../ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update the details for "{product.name}".</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductForm product={product} onFinished={() => router.push('/dashboard/admin/products')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
