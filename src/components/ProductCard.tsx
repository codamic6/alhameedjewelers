import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/types';

type ProductCardProps = {
  product: Product;
};

// Helper to check if a URL is for an image
const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Find the first image URL from the array, ignoring videos
  const firstImage = product.imageUrls?.find(isImageUrl);

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-lg shadow-lg bg-secondary border border-border h-full"
      whileHover={{ y: -5, scale: 1.03, boxShadow: '0 0 25px rgba(212,175,55,0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                No Image
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-headline text-white truncate flex-grow">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-semibold text-primary font-body">PKR {product.price.toLocaleString()}</p>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Add</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
