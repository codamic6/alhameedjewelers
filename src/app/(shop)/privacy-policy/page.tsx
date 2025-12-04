'use client';

import PageTransition from '@/components/PageTransition';

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        <h1 className="text-4xl font-bold mb-6 text-primary">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Al-Hameed Jewelers ("us", "we", or "our") operates the Al-Hameed Jewelers website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            
            <h2 className="text-2xl font-bold text-primary pt-4">Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you. This includes your name, email address, phone number, and shipping address, which are necessary to process your orders.</p>

            <h2 className="text-2xl font-bold text-primary pt-4">Data Security</h2>
            <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
            
            <h2 className="text-2xl font-bold text-primary pt-4">Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
        </div>
      </div>
    </PageTransition>
  );
}
