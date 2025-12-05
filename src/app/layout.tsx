import type { Metadata } from 'next';
import { Alegreya, Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/hooks/use-cart';
import { FirebaseClientProvider } from '@/firebase';
import { FavoriteProvider } from '@/hooks/use-favorites';

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Al-Hameed Jewelers',
  description: 'Exquisite Gold Jewelry',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn('min-h-screen bg-background font-body antialiased', alegreya.variable, inter.variable, cinzel.variable)}>
        <FirebaseClientProvider>
          <CartProvider>
            <FavoriteProvider>
                {children}
              <Toaster />
            </FavoriteProvider>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
