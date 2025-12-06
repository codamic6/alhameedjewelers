'use client';

import PageTransition from '@/components/PageTransition';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const purityData = [
    { karat: "24 Karat", purity: "99.9%", description: "The purest form of gold, too soft for most jewelry but used for coins and bars. It has a distinct bright yellow color." },
    { karat: "22 Karat", purity: "91.7%", description: "The most popular choice for traditional jewelry in Pakistan. It contains 22 parts gold and 2 parts other metals, making it durable enough for intricate designs." },
    { karat: "18 Karat", purity: "75.0%", description: "Contains 18 parts gold and 6 parts other metals. It offers a great balance of durability and purity, ideal for diamond and gemstone settings." },
    { karat: "14 Karat", purity: "58.3%", description: "Very durable and affordable. It's an excellent choice for everyday wear jewelry that needs to withstand more wear and tear." },
];

export default function PurityGuidePage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Gold Purity & Certification</h1>
            <p className="text-lg text-muted-foreground mt-4">Understanding the Quality Behind Our Craft</p>
        </div>

        <Card className="mb-12">
            <CardHeader>
                <CardTitle>Our Commitment to Authenticity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>At Al-Hameed Jewelers, we guarantee the purity and authenticity of every piece of jewelry. Our gold is sourced from reputable suppliers and is meticulously tested to ensure it meets the highest industry standards. Each item comes with a certificate of authenticity, detailing its specifications, including gold karatage and weight.</p>
                <div className="flex items-center gap-3 text-primary font-semibold">
                    <CheckCircle className="h-5 w-5"/>
                    <span>Certified and Hallmarked Jewelry</span>
                </div>
            </CardContent>
        </Card>

        <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">Guide to Gold Karats</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {purityData.map((item) => (
                    <Card key={item.karat} className="bg-secondary/50 hover:shadow-card-hover-glow transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-baseline">
                                <span>{item.karat}</span>
                                <span className="text-lg font-mono text-accent">{item.purity} Pure</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </PageTransition>
  );
}
