'use client';

import CategoryForm from '../../CategoryForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();

  const categoryDocRef = useMemoFirebase(
    () => (firestore && id ? doc(firestore, 'categories', id as string) : null),
    [firestore, id]
  );
  
  const { data: category, isLoading } = useDoc<Category>(categoryDocRef);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  if (!category) {
    return <div>Category not found.</div>;
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
                        <CardTitle>Edit Category</CardTitle>
                        <CardDescription>Update the details for "{category.name}".</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CategoryForm category={category} onFinished={() => router.push('/dashboard/admin/categories')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
