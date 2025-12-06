
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, Category } from '@/lib/types';

export type Filters = {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
};

const DEFAULT_MAX_PRICE = 100000;

export function useProductFilters() {
  const firestore = useFirestore();

  const [filters, setFiltersState] = useState<Filters>({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: DEFAULT_MAX_PRICE,
    sortBy: 'price-asc',
  });

  // Fetch all products and categories once
  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: allProducts, isLoading: productsLoading } = useCollection<Product>(productsCollection);

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesCollection);

  const maxPrice = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return DEFAULT_MAX_PRICE;
    return allProducts.reduce((max, p) => (p.price > max ? p.price : max), 0);
  }, [allProducts]);
  
  // Update price filter default when maxPrice is calculated
  useEffect(() => {
    if(maxPrice > DEFAULT_MAX_PRICE) {
      setFiltersState(prev => ({...prev, maxPrice: maxPrice}))
    }
  }, [maxPrice])

  // Memoized filtering logic
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let products = [...allProducts];

    // 1. Filter by search term
    if (filters.search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // 2. Filter by category
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    // 3. Filter by price range
    products = products.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    // 4. Sort products
    switch (filters.sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return products;
  }, [allProducts, filters]);

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };
  
  const isLoading = productsLoading || categoriesLoading;

  return {
    allProducts,
    filteredProducts,
    isLoading,
    filters,
    setFilters,
    categories: categories || [],
    maxPrice,
  };
}
