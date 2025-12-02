'use client';

import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import Recommendations from '@/components/Recommendations';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [viewedProducts, setViewedProducts] = useState<string[]>([]);
  const firestore = useFirestore();
  
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);

  useEffect(() => {
    const mockHistory = JSON.parse(
      sessionStorage.getItem('viewedProducts') || '[]'
    );
    setViewedProducts(mockHistory);
  }, []);

  const featuredProducts = products ? products.slice(0, 4) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
        <section id="featured-products" className="mb-12 md:mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary">
            Featured Collection
          </h2>
          {productsLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <Recommendations viewedProducts={viewedProducts} />
      </div>
    </motion.div>
  );
}
