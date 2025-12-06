

'use client';

import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useProductFilters } from '@/hooks/use-product-filters';
import ProductFilters from '@/components/ProductFilters';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
            {/* --- Desktop Filter Sidebar --- */}
            <aside className="hidden md:block">
                <div className="sticky top-24 space-y-6">
                     <h2 className="text-2xl font-bold text-white">Filters</h2>
                     <Separator />
                     <ProductFilters 
                        filters={filters} 
                        setFilters={setFilters} 
                        categories={categories}
                        maxPrice={maxPrice}
                        className="p-0 border-none"
                      />
                </div>
            </aside>
            
            {/* --- Products Grid --- */}
            <main>
                <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h1 className="text-4xl font-bold text-primary">
                        Our Collection
                    </h1>
                    {/* --- Mobile Filter Button --- */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                            <Button variant="outline">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Filters
                            </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-0">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="text-primary">Filters</SheetTitle>
                            </SheetHeader>
                            <div className="p-4">
                                <ProductFilters 
                                    filters={filters} 
                                    setFilters={setFilters} 
                                    categories={categories}
                                    maxPrice={maxPrice}
                                    className="p-0 border-none"
                                />
                            </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
                ) : (
                filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
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
            </main>
        </div>
      </div>
    </PageTransition>
  );
}
