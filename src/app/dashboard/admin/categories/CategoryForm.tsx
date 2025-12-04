
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type CategoryFormProps = {
  category?: Category;
  onFinished: () => void;
};

export default function CategoryForm({ category, onFinished }: CategoryFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const slug = values.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const categoryData = { ...values, slug };

    try {
      if (category) {
        // Update existing category
        const categoryRef = doc(firestore, 'categories', category.id);
        await updateDoc(categoryRef, categoryData);
        toast({ title: 'Category Updated', description: 'The category has been successfully updated.' });
      } else {
        // Add new category
        await addDoc(collection(firestore, 'categories'), categoryData);
        toast({ title: 'Category Added', description: 'The new category has been successfully added.' });
      }
      onFinished();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Rings" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the category..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? 'Update Category' : 'Create Category'}
        </Button>
      </form>
    </Form>
  );
}
