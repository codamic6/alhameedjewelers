
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Coupon, Product } from '@/lib/types';
import { Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check } from 'lucide-react';


const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be 20 characters or less').toUpperCase(),
  discountPercentage: z.coerce.number().min(1, 'Discount must be at least 1%').max(100, 'Discount cannot exceed 100%'),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  applicableProductIds: z.array(z.string()).optional(),
  usageLimit: z.coerce.number().min(0, 'Usage limit cannot be negative.'),
});

type CouponFormProps = {
  coupon?: Coupon;
  onFinished: () => void;
};

export default function CouponForm({ coupon, onFinished }: CouponFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);


  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products } = useCollection<Product>(productsCollection);

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    defaultValues: coupon
      ? {
          ...coupon,
          startDate: coupon.startDate.toDate(),
          endDate: coupon.endDate.toDate(),
          applicableProductIds: coupon.applicableProductIds || [],
          usageLimit: coupon.usageLimit || 0,
        }
      : {
          code: '',
          discountPercentage: 10,
          startDate: undefined,
          endDate: undefined,
          applicableProductIds: [],
          usageLimit: 0,
        },
  });

  const selectedProductIds = form.watch('applicableProductIds') || [];
  
  const selectedProducts = useMemo(() => {
    return products?.filter(p => selectedProductIds.includes(p.id)) ?? [];
  }, [selectedProductIds, products]);

  const toggleProduct = (productId: string) => {
    const currentIds = form.getValues('applicableProductIds') || [];
    const newIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];
    form.setValue('applicableProductIds', newIds, { shouldValidate: true, shouldDirty: true });
  }

  const onSubmit = async (values: z.infer<typeof couponSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    const couponData = {
      ...values,
      code: values.code.toUpperCase(),
      startDate: Timestamp.fromDate(values.startDate),
      endDate: Timestamp.fromDate(values.endDate),
      applicableProductIds: values.applicableProductIds || [],
      usageLimit: values.usageLimit,
      timesUsed: coupon?.timesUsed || 0, // Keep existing usage count on update
    };

    try {
      if (coupon) {
        // Update existing coupon
        const couponRef = doc(firestore, 'coupons', coupon.id);
        await updateDoc(couponRef, couponData);
        toast({ title: 'Coupon Updated', description: 'The coupon has been successfully updated.' });
      } else {
        // Add new coupon
        await addDoc(collection(firestore, 'coupons'), couponData);
        toast({ title: 'Coupon Added', description: 'The new coupon has been successfully added.' });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code</FormLabel>
                <FormControl>
                  <Input placeholder="SUMMER25" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="discountPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage Limit</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormDescription>The maximum number of times this coupon can be used. Leave 0 for unlimited.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                            field.onChange(date);
                            setStartDatePopoverOpen(false);
                        }}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                         <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                            field.onChange(date);
                            setEndDatePopoverOpen(false);
                        }}
                        disabled={(date) =>
                            form.getValues('startDate') ? date < form.getValues('startDate') : false
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
            control={form.control}
            name="applicableProductIds"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Applicable Products</FormLabel>
                    <FormDescription>Select products this coupon applies to. Leave empty to apply to all products.</FormDescription>
                     <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                        <PopoverTrigger asChild>
                             <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between h-auto min-h-10"
                                >
                                    <div className="flex-wrap flex gap-1 items-center">
                                        {selectedProducts.length > 0 ? selectedProducts.map(p => (
                                            <Badge key={p.id} variant="secondary" className="gap-1">
                                                {p.name}
                                            </Badge>
                                        )) : <span className="text-muted-foreground font-normal">Select products...</span>}
                                    </div>
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                             <Command>
                                <CommandInput placeholder="Search product..." />
                                <CommandList>
                                    <CommandEmpty>No products found.</CommandEmpty>
                                    <CommandGroup>
                                        {products?.map((product) => {
                                            const isSelected = selectedProductIds.includes(product.id);
                                            return (
                                                <CommandItem
                                                    key={product.id}
                                                    onSelect={() => toggleProduct(product.id)}
                                                    value={product.name}
                                                >
                                                   <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        isSelected ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {product.name}
                                                </CommandItem>
                                            )
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
          />

        <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {coupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </form>
    </Form>
  );
}


    