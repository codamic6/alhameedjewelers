'use client';

import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary">
          How can we help?
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We're here to assist you with any questions or concerns. Choose one of the options below to get in touch or find answers.
        </p>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="hover:shadow-card-hover-glow transition-shadow">
                <CardHeader>
                    <Phone className="mx-auto h-12 w-12 text-primary"/>
                    <CardTitle className="mt-4">Call Us</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Talk to our support team directly.</p>
                    <p className="font-semibold text-accent mt-2">+92 300 1234567</p>
                </CardContent>
            </Card>
             <Card className="hover:shadow-card-hover-glow transition-shadow">
                <CardHeader>
                    <Mail className="mx-auto h-12 w-12 text-primary"/>
                    <CardTitle className="mt-4">Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Send us an email anytime.</p>
                     <p className="font-semibold text-accent mt-2 break-all">support@alhameedjewelers.com</p>
                </CardContent>
            </Card>
             <Card className="hover:shadow-card-hover-glow transition-shadow">
                <CardHeader>
                    <MessageSquare className="mx-auto h-12 w-12 text-primary"/>
                    <CardTitle className="mt-4">FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Find quick answers to common questions.</p>
                     <Button asChild variant="link" className="mt-2 text-accent">
                        <Link href="/faqs">View FAQs</Link>
                     </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </PageTransition>
  );
}
