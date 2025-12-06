'use client';

import PageTransition from '@/components/PageTransition';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">About Al-Hameed Jewelers</h1>
            <p className="text-lg text-muted-foreground mt-4">A Legacy of Trust and Craftsmanship</p>
        </div>
        
        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg mb-12">
            <Image
                src="https://picsum.photos/seed/jewelry-store/1200/675"
                alt="Al-Hameed Jewelers Storefront"
                fill
                className="object-cover"
                data-ai-hint="jewelry store"
            />
        </div>

        <div className="space-y-8 text-lg text-muted-foreground leading-relaxed text-left">
            <p>
                Welcome to Al-Hameed Jewelers, where timeless elegance meets modern grace. For over three generations, our family has been dedicated to the art of fine jewelry making, crafting pieces that are not just accessories, but heirlooms to be cherished for a lifetime. Our journey began with a small workshop and a passion for creating beauty from precious metals and stones.
            </p>
            
            <h2 className="text-3xl font-bold text-primary pt-4 border-b border-border pb-2">Our Mission</h2>
            <p>
                Our mission is simple: to provide our customers with exquisite, high-quality jewelry that celebrates life's most precious moments. We believe that every piece of jewelry tells a story, and we are honored to be a part of yours. We are committed to ethical sourcing, superior craftsmanship, and unparalleled customer service.
            </p>

             <h2 className="text-3xl font-bold text-primary pt-4 border-b border-border pb-2">Our Craft</h2>
            <p>
                Each piece in our collection is a testament to the skill and dedication of our master craftsmen. Combining traditional techniques with contemporary designs, we ensure that every item is a work of art. We use only the finest materials, from certified 24K gold to hand-selected diamonds and gemstones, guaranteeing the purity and authenticity of our creations.
            </p>
        </div>
      </div>
    </PageTransition>
  );
}
