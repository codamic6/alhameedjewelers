'use client';

import PageTransition from '@/components/PageTransition';

export default function TermsAndConditionsPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="space-y-8 text-muted-foreground leading-relaxed">
            <h1 className="text-4xl font-bold mb-6 text-primary">
                Terms and Conditions
            </h1>
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Please read these terms and conditions carefully before using Our Service.</p>
            
            <h2 className="text-2xl font-bold text-primary pt-4">Interpretation and Definitions</h2>
            <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

            <h2 className="text-2xl font-bold text-primary pt-4">Acknowledgement</h2>
            <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
            
            <h2 className="text-2xl font-bold text-primary pt-4">Placing Orders for Goods</h2>
            <p>By placing an Order for Goods through the Service, You warrant that You are legally capable of entering into binding contracts. All orders are subject to availability and confirmation of the order price.</p>

            <h2 className="text-2xl font-bold text-primary pt-4">Return and Refund Policy</h2>
            <p>We are committed to ensuring your satisfaction with any merchandise you have ordered from us.</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>We offer a 7-day return policy from the date of delivery.</li>
                <li>To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.</li>
                <li>Customized or engraved items are not eligible for return or refund.</li>
                <li>To initiate a return, please contact our customer service. Upon verification, we will arrange for the item to be picked up.</li>
                <li>Refunds will be processed to your original method of payment within 10 business days after we receive and inspect the returned item.</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary pt-4">Disputes Resolution</h2>
            <p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company. If the dispute is not resolved, it shall be referred to arbitration in accordance with the laws of Pakistan.</p>

            <h2 className="text-2xl font-bold text-primary pt-4">Changes to These Terms and Conditions</h2>
            <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms.</p>
        </div>
      </div>
    </PageTransition>
  );
}
