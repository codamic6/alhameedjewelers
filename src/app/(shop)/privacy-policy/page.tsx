'use client';

import PageTransition from '@/components/PageTransition';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="space-y-6 text-muted-foreground leading-relaxed">
            <h1 className="text-4xl font-bold mb-6 text-primary">
            Privacy Policy
            </h1>
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Al-Hameed Jewelers ("us", "we", or "our") operates the Al-Hameed Jewelers website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            
            <h2 className="text-2xl font-bold text-primary pt-4">Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you. This includes your name, email address, phone number, and shipping address, which are necessary to process your orders. We also collect information you provide when you contact our customer service team or participate in surveys.</p>

            <h2 className="text-2xl font-bold text-primary pt-4">Use of Data</h2>
            <p>The data we collect is used in the following ways:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
                <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
                <li>To manage your account and your orders.</li>
                <li>To contact you with updates, promotional materials, and other information that may be of interest to you.</li>
                <li>To respond to your inquiries and provide customer support.</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary pt-4">Data Security</h2>
            <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, such as SSL encryption and secure server infrastructure, we cannot guarantee its absolute security.</p>
            
            <h2 className="text-2xl font-bold text-primary pt-4">Your Data Protection Rights</h2>
            <p>You have the right to access, update, or delete the information we have on you. If you wish to be informed about what Personal Data we hold about you and if you want it to be removed from our systems, please contact us through our <Link href="/contact" className="text-primary underline">Contact Page</Link>.</p>

            <h2 className="text-2xl font-bold text-primary pt-4">Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        </div>
      </div>
    </PageTransition>
  );
}
