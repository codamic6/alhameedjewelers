'use client';

import CategoryForm from '../CategoryForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/PageTransition';
import { ArrowLeft } from 'lucide-react';

export default function NewCategoryPage() {
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
                        <CardTitle>Add New Category</CardTitle>
                        <CardDescription>Fill out the details for the new category.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CategoryForm onFinished={() => router.push('/dashboard/admin/categories')} />
            </CardContent>
        </Card>
    </PageTransition>
  );
}
