
'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Loader2, CreditCard, Heart, ZoomIn } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useCart } from '@/hooks/use-cart';
import PageTransition from '@/components/PageTransition';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const firestore = useFirestore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Sticky bar visibility on scroll for mobile
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (window.innerWidth < 768 && latest > 500) {
      setShowStickyBar(true);
    } else {
      setShowStickyBar(false);
    }
  });


  useEffect(() => {
    if (!firestore || !slug) return;

    const getProductBySlug = async () => {
      setLoading(true);
      try {
        const productsRef = collection(firestore, 'products');
        const q = query(productsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const productDoc = querySnapshot.docs[0];
          const productData = { id: productDoc.id, ...productDoc.data() } as Product;
          setProduct(productData);
          if (productData.imageIds && productData.imageIds.length > 0) {
            setSelectedImage(productData.imageIds[0]);
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    getProductBySlug();

  }, [firestore, slug]);


  useEffect(() => {
    if (product) {
      const viewed = JSON.parse(
        sessionStorage.getItem('viewedProducts') || '[]'
      );
      if (!viewed.includes(product.name)) {
        viewed.push(product.name);
        sessionStorage.setItem('viewedProducts', JSON.stringify(viewed));
      }
    }
  }, [product]);
  
  const handleBuyNow = () => {
    if(product) {
      addToCart(product, quantity);
      router.push('/checkout');
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!product) {
    notFound();
  }

  const images = (product.imageIds || []).map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean);
  const mainImage = PlaceHolderImages.find(p => p.id === selectedImage);
  
  const ProductDetails = () => (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl md:text-4xl font-bold text-primary">{product.name}</h1>
      <p className="text-2xl font-bold text-accent">
        ${product.price.toLocaleString()}
      </p>
      
      <Separator />

      <p className="text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      )}
      
      <Separator />

      <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center border rounded-full h-12">
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="rounded-full"
              >
              <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(q => q + 1)}
              className="rounded-full"
              >
              <Plus className="h-4 w-4" />
              </Button>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 border">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Add to favorites</span>
          </Button>
      </div>

      <div className="flex-col sm:flex-row items-center gap-4 mt-4 hidden md:flex">
        <Button
          size="lg"
          className="flex-1 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => addToCart(product, quantity)}
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
         <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleBuyNow}
        >
          <CreditCard className="mr-2 h-5 w-5" /> Buy Now
        </Button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          
          {/* Image Gallery - Desktop */}
          <div className="hidden md:flex flex-col gap-4 items-center">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg cursor-zoom-in group">
                  {mainImage && (
                    <Image
                      src={mainImage.imageUrl}
                      alt={product.name}
                      width={800}
                      height={800}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={mainImage.imageHint}
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-12 w-12 text-white/80"/>
                  </div>
                </div>
              </DialogTrigger>
               <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                 <DialogTitle className="sr-only">{product.name} - Enlarged View</DialogTitle>
                 {mainImage && (
                    <Image
                      src={mainImage.imageUrl}
                      alt={product.name}
                      width={1200}
                      height={1200}
                      className="w-full h-auto object-contain rounded-lg"
                      data-ai-hint={mainImage.imageHint}
                    />
                 )}
               </DialogContent>
            </Dialog>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 w-full">
                {images.map(image => image && (
                  <button 
                    key={image.id}
                    onClick={() => setSelectedImage(image.id)}
                    className={cn(
                      "aspect-square rounded-md overflow-hidden ring-offset-background ring-offset-2 focus:ring-2 focus:outline-none",
                      selectedImage === image.id ? "ring-2 ring-primary" : "ring-1 ring-transparent hover:ring-primary/50"
                    )}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`Thumbnail of ${product.name}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Image Carousel - Mobile */}
          <div className="md:hidden -mx-4">
              <Carousel className="w-full">
                  <CarouselContent>
                      {images.map(image => image && (
                          <CarouselItem key={image.id}>
                              <div className="aspect-square relative">
                                  <Image
                                      src={image.imageUrl}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      data-ai-hint={image.imageHint}
                                      priority
                                  />
                              </div>
                          </CarouselItem>
                      ))}
                  </CarouselContent>
              </Carousel>
          </div>

          {/* Product Details for both mobile and desktop */}
          <ProductDetails />
        </div>
      </div>

       {/* Sticky Add to Cart Bar for Mobile */}
      <motion.div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/80 backdrop-blur-sm border-t border-border p-4 flex items-center justify-between gap-4"
        initial={{ y: "100%" }}
        animate={{ y: showStickyBar ? 0 : "100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
      >
        <div>
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="font-bold text-lg text-primary">${product.price.toLocaleString()}</p>
        </div>
        <Button size="lg" className="flex-1" onClick={() => addToCart(product, quantity)}>
          <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
      </motion.div>

    </PageTransition>
  );
}
