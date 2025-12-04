'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a temporary redirect page. 
// The actual checkout process starts at the 'shipping' step.
export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/checkout/shipping');
  }, [router]);

  return null; 
}
