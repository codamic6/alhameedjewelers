
'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Loader2, CreditCard, Heart, ZoomIn, X } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useCart } from '@/hooks/use-cart';
import PageTransition from '@/components/PageTransition';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProductCard from '@/components/ProductCard';

function RelatedProducts({ currentProductId }: { currentProductId: string }) {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'products'), limit(5)) : null,
        [firestore]
    );
    const { data: products, isLoading } = useCollection<Product>(productsQuery);

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const relatedProducts = products?.filter(p => p.id !== currentProductId).slice(0, 4) ?? [];

    if (relatedProducts.length === 0) return null;

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}


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
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(undefined);

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
            setSelectedImageId(productData.imageIds[0]);
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
      const viewed = JSON.parse(sessionStorage.getItem('viewedProducts') || '[]');
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
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!product) {
    notFound();
  }

  const images = (product.imageIds || []).map(id => PlaceHolderImages.find(p => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
  const selectedImage = images.find(p => p.id === selectedImageId);
  
  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          
          {/* --- IMAGE GALLERY (Desktop & Mobile) --- */}
          <div>
            {/* Desktop Gallery */}
            <div className="hidden md:flex flex-col gap-4 sticky top-24">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg cursor-zoom-in group">
                    {selectedImage ? (
                      <Image
                        src={selectedImage.imageUrl}
                        alt={product.name}
                        width={800}
                        height={800}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={selectedImage.imageHint}
                        priority
                      />
                    ) : <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">No Image</div>}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="h-12 w-12 text-white/80"/>
                    </div>
                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full h-10 w-10 bg-black/20 text-white hover:bg-black/50 backdrop-blur-sm">
                      <Heart className="h-5 w-5" />
                      <span className="sr-only">Add to favorites</span>
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                  <DialogTitle className="sr-only">{product.name} - Enlarged View</DialogTitle>
                   {selectedImage && (
                      <Image
                        src={selectedImage.imageUrl}
                        alt={product.name}
                        width={1200}
                        height={1200}
                        className="w-full h-auto object-contain rounded-lg"
                        data-ai-hint={selectedImage.imageHint}
                      />
                   )}
                   <DialogClose className="absolute -top-2 -right-2 rounded-full bg-background p-2 opacity-100 hover:opacity-80">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                   </DialogClose>
                </DialogContent>
              </Dialog>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map(image => (
                    <button 
                      key={image.id}
                      onClick={() => setSelectedImageId(image.id)}
                      className={cn(
                        "aspect-square rounded-md overflow-hidden ring-offset-background ring-offset-2 focus:ring-2 focus:outline-none transition-all",
                        selectedImageId === image.id ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-transparent hover:ring-primary/50 opacity-70 hover:opacity-100"
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
            
            {/* Mobile Carousel */}
            <div className="md:hidden w-full">
                <Carousel className="w-full">
                    <CarouselContent>
                        {images.length > 0 ? images.map(image => (
                            <CarouselItem key={image.id}>
                                <div className="aspect-square relative rounded-lg overflow-hidden">
                                    <Image
                                        src={image.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        data-ai-hint={image.imageHint}
                                        priority
                                    />
                                     <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full h-10 w-10 bg-black/20 text-white hover:bg-black/50 backdrop-blur-sm">
                                        <Heart className="h-5 w-5" />
                                        <span className="sr-only">Add to favorites</span>
                                    </Button>
                                </div>
                            </CarouselItem>
                        )) : (
                           <CarouselItem>
                             <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary flex items-center justify-center text-muted-foreground">No Image</div>
                           </CarouselItem>
                        )}
                    </CarouselContent>
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                </Carousel>
            </div>
          </div>

          {/* --- PRODUCT DETAILS --- */}
          <div className="flex flex-col gap-4 md:gap-6 mt-4 md:mt-0">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">{product.name}</h1>
              <p className="text-2xl md:text-3xl font-bold text-accent">${product.price.toLocaleString()}</p>
              
              <Separator />

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => ( <Badge key={tag} variant="outline">{tag}</Badge> ))}
                </div>
              )}
              
              <Separator />

              {/* --- ACTION BUTTONS (Mobile & Desktop) --- */}
              <div className="flex flex-col gap-4 mt-4">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-full h-12">
                          <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="rounded-full"><Minus className="h-4 w-4" /></Button>
                          <span className="w-12 text-center font-bold">{quantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} className="rounded-full"><Plus className="h-4 w-4" /></Button>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 border">
                          <Heart className="h-5 w-5" />
                          <span className="sr-only">Add to favorites</span>
                      </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Button size="lg" className="w-full sm:flex-1" onClick={() => addToCart(product, quantity)}><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</Button>
                      <Button size="lg" variant="outline" className="w-full sm:flex-1" onClick={handleBuyNow}><CreditCard className="mr-2 h-5 w-5" /> Buy Now</Button>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <RelatedProducts currentProductId={product.id} />

    </PageTransition>
  );
}
