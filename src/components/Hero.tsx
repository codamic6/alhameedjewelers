import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center text-center">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={heroImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 p-4 text-white">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg text-primary">
          Timeless Elegance, Modern Grace
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-slate-200 drop-shadow-md">
          Discover our exquisite collection of handcrafted gold jewelry, designed to be cherished for a lifetime.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="#featured-products">Explore Collection</Link>
        </Button>
      </div>
    </section>
  );
}
