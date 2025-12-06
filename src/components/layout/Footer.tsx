import Link from 'next/link';
import { Gem } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
                 <Link href="/" className="flex items-center gap-2 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                    <span className="font-logo font-bold text-lg text-white">Al-Hameed Jewelers</span>
                </Link>
                <p className="text-sm text-muted-foreground text-center md:text-left">
                    Timeless Elegance, Modern Grace.
                </p>
            </div>
            <div>
                <h3 className="font-bold text-primary mb-3">Shop</h3>
                <div className="flex flex-col gap-2 text-sm">
                    <Link href="/products" className="text-white hover:text-primary">All Products</Link>
                    <Link href="/about" className="text-white hover:text-primary">About Us</Link>
                    <Link href="/purity-guide" className="text-white hover:text-primary">Purity Guide</Link>
                    <Link href="/size-guide" className="text-white hover:text-primary">Size Guide</Link>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-primary mb-3">Customer Service</h3>
                <div className="flex flex-col gap-2 text-sm">
                    <Link href="/contact" className="text-white hover:text-primary">Contact Us</Link>
                    <Link href="/faqs" className="text-white hover:text-primary">FAQs</Link>
                    <Link href="/dashboard/orders" className="text-white hover:text-primary">Track Order</Link>
                    <Link href="/shipping-policy" className="text-white hover:text-primary">Shipping Policy</Link>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-primary mb-3">Legal</h3>
                <div className="flex flex-col gap-2 text-sm">
                    <Link href="/privacy-policy" className="text-white hover:text-primary">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-white hover:text-primary">Terms & Conditions</Link>
                </div>
            </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
             <p>© {new Date().getFullYear()} Al-Hameed Jewelers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
