
'use client';

import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Loader2, CreditCard, Heart, ZoomIn, X, Video, Camera } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useCart } from '@/hooks/use-cart';
import PageTransition from '@/components/PageTransition';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProductCard from '@/components/ProductCard';
import { useFavorites } from '@/hooks/use-favorites';
import { useToast } from '@/hooks/use-toast';
import VirtualTryOn from '@/components/VirtualTryOn';


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

const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url);

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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(undefined);
  const [modalMediaUrl, setModalMediaUrl] = useState<string | null>(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  const { user } = useUser();
  const { toast } = useToast();
  const { toggleFavorite, isFavorited } = useFavorites();
  
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
          if (productData.imageUrls && productData.imageUrls.length > 0) {
            setSelectedImageUrl(productData.imageUrls[0]);
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

  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You need to be logged in to add products to your favorites.',
      });
      router.push('/login');
      return;
    }
    if (product) {
      toggleFavorite(product.id);
    }
  };
  
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

  const isProductFavorited = isFavorited(product.id);
  const currentMediaIsVideo = selectedImageUrl ? isVideo(selectedImageUrl) : false;
  
  const MediaDialogContent = ({ mediaUrl }: { mediaUrl: string | null }) => {
    if (!mediaUrl) return null;
    const isModalVideo = isVideo(mediaUrl);

    return (
        <DialogContent
            className="max-w-none w-auto h-auto max-h-[90vh] bg-transparent border-none shadow-none p-2"
        >
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
            {isModalVideo ? (
                <video key={mediaUrl} controls autoPlay className="w-auto h-auto max-h-[90vh] object-contain rounded-lg">
                    <source src={mediaUrl} />
                </video>
            ) : (
                <Image
                    src={mediaUrl}
                    alt={product.name}
                    width={1200}
                    height={1200}
                    className="w-auto h-auto max-h-[90vh] object-contain rounded-lg"
                />
            )}
        </DialogContent>
    );
};


  return (
    <PageTransition>
      <Dialog onOpenChange={(isOpen) => !isOpen && setModalMediaUrl(null)}>
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            
            {/* --- IMAGE GALLERY (Desktop & Mobile) --- */}
            <div>
              {/* Desktop Gallery */}
              <div className="hidden md:flex flex-col gap-4 sticky top-24">
                  <DialogTrigger asChild>
                     <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg group bg-secondary cursor-pointer" onClick={() => setModalMediaUrl(selectedImageUrl || null)}>
                      {selectedImageUrl ? (
                          currentMediaIsVideo ? (
                              <video key={selectedImageUrl} controls className="w-full h-full object-contain">
                                  <source src={selectedImageUrl} />
                                  Your browser does not support the video tag.
                              </video>
                          ) : (
                            <Image
                              src={selectedImageUrl}
                              alt={product.name}
                              width={800}
                              height={800}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              priority
                            />
                          )
                      ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>}
                      {!currentMediaIsVideo && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="h-12 w-12 text-white/80"/>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>

                <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full h-10 w-10 bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm z-10" onClick={handleFavoriteClick}>
                  <Heart className={cn("h-5 w-5", isProductFavorited && "fill-primary text-primary")} />
                  <span className="sr-only">Add to favorites</span>
                </Button>

                {product.imageUrls.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.imageUrls.map(url => (
                      <button 
                        key={url}
                        onClick={() => setSelectedImageUrl(url)}
                        className={cn(
                          "aspect-square rounded-md overflow-hidden ring-offset-background ring-offset-2 focus:ring-2 focus:outline-none transition-all",
                          selectedImageUrl === url ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-transparent hover:ring-primary/50 opacity-70 hover:opacity-100"
                        )}
                      >
                        {isVideo(url) ? (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <Video className="h-8 w-8 text-white"/>
                            </div>
                        ) : (
                          <Image
                              src={url}
                              alt={`Thumbnail of ${product.name}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Carousel */}
              <div className="md:hidden w-full">
                  <Carousel className="w-full">
                      <CarouselContent>
                          {product.imageUrls.length > 0 ? product.imageUrls.map(url => (
                              <CarouselItem key={url}>
                                <DialogTrigger asChild>
                                  <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary cursor-pointer" onClick={() => setModalMediaUrl(url)}>
                                      {isVideo(url) ? (
                                          <video key={url} controls className="w-full h-full object-contain">
                                              <source src={url} />
                                          </video>
                                      ) : (
                                          <Image
                                              src={url}
                                              alt={product.name}
                                              fill
                                              className="object-cover"
                                              priority
                                          />
                                      )}
                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                          <ZoomIn className="h-10 w-10 text-white/80"/>
                                      </div>
                                  </div>
                                </DialogTrigger>
                              </CarouselItem>
                          )) : (
                             <CarouselItem>
                               <div className="aspect-square relative rounded-lg overflow-hidden bg-secondary flex items-center justify-center text-muted-foreground">No Image</div>
                             </CarouselItem>
                          )}
                      </CarouselContent>
                       <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full h-10 w-10 bg-black/50 text-white hover:bg-black/75 backdrop-blur-sm z-10" onClick={handleFavoriteClick}>
                          <Heart className={cn("h-5 w-5", isProductFavorited && "fill-primary text-primary")} />
                          <span className="sr-only">Add to favorites</span>
                      </Button>
                      {product.imageUrls.length > 1 && (
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
                <p className="text-2xl md:text-3xl font-bold text-accent">PKR {product.price.toLocaleString()}</p>
                
                <Separator />

                <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => ( <Badge key={tag} variant="outline">{tag}</Badge> ))}
                  </div>
                )}
                
                <Separator />

                {/* --- ACTION BUTTONS --- */}
                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-full h-12">
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="rounded-full"><Minus className="h-4 w-4" /></Button>
                            <span className="w-12 text-center font-bold">{quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} className="rounded-full"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 border hidden md:flex" onClick={handleFavoriteClick}>
                            <Heart className={cn("h-5 w-5", isProductFavorited && "fill-primary text-primary")} />
                            <span className="sr-only">Add to favorites</span>
                        </Button>
                    </div>
                     <Dialog open={isTryOnOpen} onOpenChange={setIsTryOnOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" variant="outline" className="w-full">
                                <Camera className="mr-2 h-5 w-5" /> Virtual Try-On
                            </Button>
                        </DialogTrigger>
                        <VirtualTryOn 
                            product={product} 
                            onClose={() => setIsTryOnOpen(false)}
                        />
                    </Dialog>
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
        
        <MediaDialogContent mediaUrl={modalMediaUrl} />
      </Dialog>
    </PageTransition>
  );
}
