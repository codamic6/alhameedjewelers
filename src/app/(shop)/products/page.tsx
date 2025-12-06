
'use client';

import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useProductFilters } from '@/hooks/use-product-filters';
import ProductFilters from '@/components/ProductFilters';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const { 
    filteredProducts, 
    isLoading,
    filters,
    setFilters,
    categories,
    maxPrice
  } = useProductFilters();

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
        <section id="all-products">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <h1 className="text-4xl font-bold text-center text-primary">
              Our Collection
            </h1>
             <Collapsible className="w-full md:w-auto">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 md:mt-0 md:absolute md:top-full md:right-0 md:w-full md:max-w-xs md:z-20 md:p-0 md:bg-secondary md:border md:rounded-lg md:shadow-lg">
                  <ProductFilters 
                    filters={filters} 
                    setFilters={setFilters} 
                    categories={categories}
                    maxPrice={maxPrice}
                    className="p-4 border rounded-lg md:p-4 md:border-none"
                  />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
             filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-bold text-white">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                </div>
             )
          )}
        </section>
      </div>
    </PageTransition>
  );
}
