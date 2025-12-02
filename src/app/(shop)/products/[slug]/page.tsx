"use client";

import { products } from '@/lib/data';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import PageTransition from '@/components/PageTransition';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  const product = products.find(p => p.slug === slug);

  useEffect(() => {
    if (product) {
      const viewed = JSON.parse(sessionStorage.getItem('viewedProducts') || '[]');
      if (!viewed.includes(product.name)) {
        viewed.push(product.name);
        sessionStorage.setItem('viewedProducts', JSON.stringify(viewed));
      }
    }
  }, [product]);

  if (!product) {
    notFound();
  }

  const image = PlaceHolderImages.find(p => p.id === product.imageId);

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
            {image && (
              <Image
                src={image.imageUrl}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold text-primary">{product.name}</h1>
            <p className="text-2xl font-bold text-accent">${product.price.toLocaleString()}</p>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => addToCart(product, quantity)}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
