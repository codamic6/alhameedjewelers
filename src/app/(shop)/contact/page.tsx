'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(5, 'Subject must be at least 5 characters long.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

export default function ContactPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    setIsSubmitting(true);

    try {
      const messagesRef = collection(firestore, 'contact-messages');
      await addDoc(messagesRef, {
        ...values,
        timestamp: serverTimestamp(),
        isRead: false,
      });

      toast({
        title: 'Message Sent!',
        description: "We've received your message and will get back to you shortly.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not send your message.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-primary">Get In Touch</h1>
                <p className="text-lg text-muted-foreground">
                    Have a question or a special request? We'd love to hear from you. Fill out the form, and our team will get back to you as soon as possible.
                </p>
                 <p className="text-muted-foreground">
                    You can also visit our <Link href="/faqs" className="text-primary underline">FAQs</Link> page for common questions or reach out through our <Link href="/help" className="text-primary underline">help center</Link>.
                </p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="subject" render={({ field }) => ( <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Question about a product" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="message" render={({ field }) => ( <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Your message..." {...field} rows={4}/></FormControl><FormMessage /></FormItem> )} />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                        Send Message
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </PageTransition>
  );
}
