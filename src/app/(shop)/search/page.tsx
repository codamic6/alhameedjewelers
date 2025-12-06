
'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useProductFilters } from '@/hooks/use-product-filters';
import ProductFilters from '@/components/ProductFilters';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


export default function SearchPage() {
  const router = useRouter();
  const { 
    filteredProducts, 
    isLoading,
    filters,
    setFilters,
    categories,
    maxPrice
  } = useProductFilters();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between h-[70px] bg-black border-b border-[#2B2B2B] px-4">
        <button onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </button>
        <h1 className="text-xl font-headline text-primary">Search</h1>
        <div className="w-8"></div>
      </header>

      <main className="p-5">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
             <ProductFilters 
                filters={filters} 
                setFilters={setFilters} 
                categories={categories}
                maxPrice={maxPrice}
                className="p-0 border-none"
              />
          </div>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="space-y-4">
                <AnimatePresence>
                {filteredProducts.map((product, index) => {
                    const image = product.imageUrls && product.imageUrls[0];
                    return(
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                        <Link href={`/products/${product.slug}`}>
                            <div className="bg-[#0A0A0A] p-4 rounded-lg flex items-center gap-4 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                                {image && (
                                    <Image
                                    src={image}
                                    alt={product.name}
                                    width={60}
                                    height={60}
                                    className="rounded-md aspect-square object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-body text-white">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                </div>
                                <p className="font-semibold text-primary font-body">PKR {product.price.toLocaleString()}</p>
                            </div>
                        </Link>
                    </motion.div>
                    )
                })}
                </AnimatePresence>
                {filteredProducts.length === 0 && !isLoading && (
                     <div className="text-center py-10">
                        <h3 className="text-xl font-bold text-white">No Products Found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}
