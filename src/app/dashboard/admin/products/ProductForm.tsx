
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
import { Loader2, X, Sparkles } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import FileUpload from '@/components/FileUpload';
import { generateProductDescription, type AIProductDescriptionInput } from '@/ai/ai-product-description-generator';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Please select a category'),
  imageUrls: z.array(z.string()).min(1, 'Please upload at least one image or video'),
  tags: z.array(z.string()).optional(),
  metalType: z.string().min(2, 'Please specify the metal type.'),
  style: z.string().optional(),
});

type ProductFormProps = {
  product?: Product;
  onFinished: () => void;
};

export default function ProductForm({ product, onFinished }: ProductFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
          style: product.style || '',
        }
      : {
          name: '',
          description: '',
          price: 0,
          category: '',
          imageUrls: [],
          tags: [],
          metalType: 'Gold',
          style: '',
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

  const handleGenerateDescription = async () => {
    const { name, category, metalType, style, tags } = form.getValues();
    if (!name || !category || !metalType) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in Name, Category, and Metal Type before generating."
        });
        return;
    }
    
    setIsGenerating(true);
    try {
        const input: AIProductDescriptionInput = {
            productName: name,
            productCategory: category,
            productMaterial: metalType,
            productStyle: style || 'Elegant',
            productFeatures: tags?.join(', ') || '',
            goldPrice: 65.50, // Mock price, can be replaced with a live API call
        };
        const result = await generateProductDescription(input);
        form.setValue('description', result.description, { shouldValidate: true });
        toast({ title: 'Description Generated!', description: 'The AI has crafted a new description.' });
    } catch (error) {
        console.error("AI generation failed:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate description.' });
    } finally {
        setIsGenerating(false);
    }
  }


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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormLabel htmlFor="description">Description</FormLabel>
                         <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4 text-primary"/>}
                            Generate with AI
                         </Button>
                    </div>
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="!mt-0">
                        <FormControl>
                            <Textarea id="description" placeholder="Describe the product..." {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

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
                 <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="metalType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Metal Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a metal" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Silver">Silver</SelectItem>
                                    <SelectItem value="Platinum">Platinum</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="style"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Style</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Modern, Vintage" {...field} />
                            </FormControl>
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
                      <FormLabel>Features / Tags</FormLabel>
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
                            placeholder="Add tags (e.g., Handcrafted) and press Enter..."
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
            <Button type="submit" disabled={isSubmitting || isGenerating} size="lg">
                {(isSubmitting || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Update Product' : 'Add Product'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
