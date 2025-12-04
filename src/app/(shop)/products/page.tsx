'use client';

import ProductCard from '@/components/ProductCard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function ProductsPage() {
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );

  const { data: products, isLoading: productsLoading } =
    useCollection<Product>(productsCollection);

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
        <section id="all-products">
          <h1 className="text-4xl font-bold text-center mb-8 text-primary">
            Our Collection
          </h1>
          {productsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products?.map((product, index) => (
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
          )}
        </section>
      </div>
    </PageTransition>
  );
}
