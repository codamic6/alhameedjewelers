'use client';

import PageTransition from '@/components/PageTransition';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Clock, MapPin } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Shipping Policy</h1>
            <p className="text-lg text-muted-foreground mt-4">Delivering Your Precious Items Safely and Securely</p>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Package className="h-8 w-8 text-primary"/>
                    <CardTitle>Secure & Insured Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Every order is fully insured during transit. We partner with trusted courier services to ensure your valuable jewelry reaches you safely. A signature is required upon delivery for all orders.</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Clock className="h-8 w-8 text-primary"/>
                    <CardTitle>Estimated Delivery Times</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><span className="font-semibold text-white">Karachi, Lahore, Islamabad:</span> 2-3 business days.</li>
                        <li><span className="font-semibold text-white">Other Major Cities:</span> 3-5 business days.</li>
                        <li><span className="font-semibold text-white">Remote Areas:</span> 5-7 business days.</li>
                    </ul>
                     <p className="text-sm text-muted-foreground mt-4">Please note that these are estimated times. Delivery may be delayed due to public holidays or unforeseen circumstances.</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <MapPin className="h-8 w-8 text-primary"/>
                    <CardTitle>Shipping Charges & Locations</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">We are proud to offer <span className="font-semibold text-accent">FREE shipping</span> on all orders within Pakistan. Currently, we only ship to addresses within Pakistan and do not offer international shipping.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </PageTransition>
  );
}
