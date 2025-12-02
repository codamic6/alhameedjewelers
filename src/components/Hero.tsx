import Link from 'next/link';
import { Button } from './ui/button';
import { Gem } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 flex items-center justify-center text-center bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 p-4 max-w-4xl mx-auto"
      >
        <div className="flex justify-center mb-4">
          <Gem className="h-16 w-16 text-primary drop-shadow-glow-gold" />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold mb-4 text-primary">
          Timeless Elegance, Modern Grace
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-muted-foreground font-body">
          Discover our exquisite collection of handcrafted gold jewelry, designed to be cherished for a lifetime.
        </p>
        <Button asChild size="lg">
          <Link href="#featured-products">Explore Collection</Link>
        </Button>
      </motion.div>
    </section>
  );
}
