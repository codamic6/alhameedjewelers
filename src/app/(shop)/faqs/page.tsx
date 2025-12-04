'use client';

import PageTransition from '@/components/PageTransition';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
    {
        question: "What payment methods do you accept?",
        answer: "We currently accept Payment on Delivery (POD). We are working on adding more payment options like Easy Paisa and Jazz Cash soon."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for unused and undamaged items. Please contact our customer support to initiate a return."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive an update. You can also view your order status in the 'My Orders' section of your dashboard."
    },
    {
        question: "Is the gold certified?",
        answer: "Yes, all our gold jewelry is certified for purity and authenticity. We guarantee the quality of our products."
    },
];

export default function FaqsPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <h1 className="text-4xl font-bold text-center mb-10 text-primary">
          Frequently Asked Questions
        </h1>
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
                 <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg text-left hover:text-accent">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base">
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </div>
    </PageTransition>
  );
}
