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

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const image = product.imageUrls && product.imageUrls[0];

  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-lg bg-secondary border border-border"
      whileHover={{ y: -5, scale: 1.03, boxShadow: '0 0 25px rgba(212,175,55,0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary">
          {image && (
            <Image
              src={image}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-headline text-white truncate">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-primary font-body">PKR {product.price.toLocaleString()}</p>
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
