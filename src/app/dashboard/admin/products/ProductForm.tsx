
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@/lib/types';
import { Loader2, X } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Please select a category'),
  imageUrls: z.array(z.string()).min(1, 'Please upload at least one image or video'),
  tags: z.array(z.string()).optional(),
});

type ProductFormProps = {
  product?: Product;
  onFinished: () => void;
};

export default function ProductForm({ product, onFinished }: ProductFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories } = useCollection<Category>(categoriesCollection);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          tags: product.tags || [],
          imageUrls: product.imageUrls || [],
        }
      : {
          name: '',
          description: '',
          price: 0,
          category: '',
          imageUrls: [],
          tags: [],
        },
  });
  
  const tags = form.watch('tags') || [];

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        form.setValue('tags', [...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);

    const slug = values.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const productData = { ...values, slug };

    try {
      if (product) {
        // Update existing product
        const productRef = doc(firestore, 'products', product.id);
        await updateDoc(productRef, productData);
        toast({ title: 'Product Updated', description: 'The product has been successfully updated.' });
      } else {
        // Add new product
        await addDoc(collection(firestore, 'products'), productData);
        toast({ title: 'Product Added', description: 'The new product has been successfully added.' });
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Ornate Gold Necklace" {...field} />
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
                        <Textarea placeholder="Describe the product..." {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (PKR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                                <button
                                  type="button"
                                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3 text-accent-foreground hover:text-foreground" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder="Add tags and press Enter..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            {/* Right Column: File Uploader */}
            <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Media</FormLabel>
                      <FormControl>
                        <FileUpload 
                          bucket="Assets"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>

        <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Update Product' : 'Add Product'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
