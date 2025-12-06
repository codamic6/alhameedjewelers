'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAIGiftRecommendations } from '@/lib/actions';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

type GiftFinderProps = {
    allProducts: Product[];
}

export default function GiftFinder({ allProducts }: GiftFinderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ recommendations: { productId: string, reason: string }[], introductoryText: string } | null>(null);

  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');
  const [style, setStyle] = useState('');

  const handleFindGift = async () => {
    if (!recipient || !occasion || !style) return;
    setIsLoading(true);
    setStep(2);
    try {
      const response = await getAIGiftRecommendations({ recipient, occasion, style }, allProducts);
      setResults(response);
    } catch (error) {
      console.error(error);
      setStep(1); // Go back to form on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
      setStep(1);
      setResults(null);
      setRecipient('');
      setOccasion('');
      setStyle('');
  }

  const recommendedProducts = results
    ? results.recommendations
        .map(rec => {
            const product = allProducts.find(p => p.id === rec.productId);
            return product ? { ...product, reason: rec.reason } : null;
        })
        .filter((p): p is Product & { reason: string } => p !== null)
    : [];


  return (
    <section className="text-center bg-secondary p-8 rounded-lg shadow-lg border border-border/40">
        <Sparkles className="mx-auto h-12 w-12 text-primary" />
        <h2 className="text-3xl font-bold text-primary mt-4">Find The Perfect Gift</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mt-2">
            Don't know what to choose? Let our AI assistant help you find the perfect piece of jewelry for your loved one.
        </p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button size="lg" className="mt-6" onClick={() => setIsOpen(true)}>
                <Wand2 className="mr-2 h-5 w-5" />
                Ask Our AI Assistant
            </Button>
            <DialogContent className="sm:max-w-[480px] md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">AI Gift Finder</DialogTitle>
                    <DialogDescription className="text-center">
                        Answer a few questions to get personalized recommendations.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1 py-4">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">Who is this gift for?</Label>
                                <Input id="recipient" placeholder="e.g., My Wife, Mom, Best Friend" value={recipient} onChange={e => setRecipient(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="occasion">What's the occasion?</Label>
                                <Input id="occasion" placeholder="e.g., Anniversary, Her Birthday, Eid" value={occasion} onChange={e => setOccasion(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="style">What's their style?</Label>
                                <Input id="style" placeholder="e.g., Simple and elegant, Modern and bold, Classic" value={style} onChange={e => setStyle(e.target.value)} />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg font-semibold">Finding the perfect gifts...</p>
                            <p className="text-muted-foreground">Our AI is curating a special collection just for you.</p>
                        </motion.div>
                    )}

                    {step === 2 && !isLoading && results && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <p className="text-center text-lg mb-6">{results.introductoryText}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {recommendedProducts.map(product => (
                                    <div key={product.id}>
                                        <ProductCard product={product} />
                                        <p className="text-xs text-muted-foreground mt-2 text-center italic">"{product.reason}"</p>
                                    </div>
                                ))}
                            </div>
                         </motion.div>
                    )}
                </div>
                
                <DialogFooter className="mt-auto pt-4 border-t">
                    {step === 1 && (
                        <Button type="button" size="lg" className="w-full" onClick={handleFindGift} disabled={!recipient || !occasion || !style}>
                            Find Gift
                        </Button>
                    )}
                     {step === 2 && !isLoading && (
                        <Button type="button" size="lg" variant="outline" className="w-full" onClick={handleReset}>
                            Start Over
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </section>
  );
}
