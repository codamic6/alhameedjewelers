import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const image = PlaceHolderImages.find(p => p.id === product.imageId);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg shadow-lg bg-secondary border border-border"
      whileHover={{ y: -5, scale: 1.03, boxShadow: '0 0 25px rgba(212,175,55,0.2)' }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={image.imageHint}
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
          <p className="text-xl font-semibold text-primary font-body">${product.price.toLocaleString()}</p>
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
