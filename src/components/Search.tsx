'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsCollection);

  useEffect(() => {
    setSearchTerm('');
    setResults([]);
    setIsFocused(false);
  }, [pathname]);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
        <input
          type="text"
          placeholder="Search gold jewelry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full h-[48px] bg-[#111111] border border-[#2B2B2B] rounded-lg text-white placeholder:text-[#777777] pl-12 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-200 ease-in-out"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-5 w-5 text-primary" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && (searchTerm.length > 1) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-full mt-2 w-full bg-[#0A0A0A] rounded-lg border border-[#1A1A1A] shadow-lg overflow-hidden z-10 max-h-96 overflow-y-auto"
          >
            {productsLoading && (
                <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
            {results.length > 0 ? (
                 <ul>
                    {results.map((product) => {
                        const image = PlaceHolderImages.find(p => p.id === product.imageId);
                        return (
                        <li key={product.id}>
                            <Link
                            href={`/products/${product.slug}`}
                            className="flex items-center p-3 h-[70px] hover:bg-[#1A1A1A] transition-colors duration-200 ease-in-out"
                            >
                            {image && (
                                <Image
                                src={image.imageUrl}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="rounded-md aspect-square object-cover"
                                data-ai-hint={image.imageHint}
                                />
                            )}
                            <div className="ml-4 flex-1">
                                <p className="font-body text-white">{product.name}</p>
                            </div>
                            <p className="font-semibold text-primary font-body">${product.price.toLocaleString()}</p>
                            </Link>
                        </li>
                        );
                    })}
                </ul>
            ) : !productsLoading && (
                <div className="p-4 text-center text-muted-foreground">No results found.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
