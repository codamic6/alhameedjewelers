'use client';

import ProductCard from '@/components/ProductCard';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useFavorites } from '@/hooks/use-favorites';
import { collection, query, where, documentId } from 'firebase/firestore';
import { Loader2, HeartCrack } from 'lucide-react';
import type { Product } from '@/lib/types';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

export default function FavoritesPage() {
  const { favorites: favoriteIds, isLoading: favoritesLoading } = useFavorites();
  const firestore = useFirestore();

  const favoriteProductsQuery = useMemoFirebase(() => {
    if (!firestore || !favoriteIds || favoriteIds.length === 0) {
      return null;
    }
    const productsRef = collection(firestore, 'products');
    // 'in' queries are limited to 30 items in Firestore.
    // If a user can have more favorites, pagination would be needed here.
    return query(productsRef, where(documentId(), 'in', favoriteIds.slice(0, 30)));
  }, [firestore, favoriteIds]);

  const { data: favoriteProducts, isLoading: productsLoading } =
    useCollection<Product>(favoriteProductsQuery);

  const isLoading = favoritesLoading || (favoriteIds && favoriteIds.length > 0 && productsLoading);

  return (
    <PageTransition>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">My Favorites</h1>
        <p className="text-muted-foreground">Your collection of cherished items.</p>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favoriteProducts && favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {favoriteProducts.map((product, index) => (
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
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <HeartCrack className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-white">No Favorites Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven't added any products to your favorites.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
