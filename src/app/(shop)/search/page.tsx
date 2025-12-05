'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);

  useEffect(() => {
    if (searchTerm.length > 1 && products) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchTerm, products]);

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
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <input
            type="text"
            placeholder="Search gold jewelry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full h-[56px] bg-[#111111] border border-[#2B2B2B] rounded-lg text-white placeholder:text-[#777777] pl-12 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-200 ease-in-out"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-5 w-5 text-primary" />
            </button>
          )}
        </div>

        {productsLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <div className="space-y-4">
                <AnimatePresence>
                {results.map((product, index) => {
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
            </div>
        )}
      </main>
    </div>
  );
}
