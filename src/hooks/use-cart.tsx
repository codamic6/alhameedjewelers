
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, Coupon } from '@/lib/types';
import { useToast } from './use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';


export type CartItem = {
  product: Product;
  quantity: number;
};

type ShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type CheckoutState = {
    shippingAddress: ShippingAddress | null;
    paymentMethod: string | null;
}

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  checkoutState: CheckoutState;
  setCheckoutState: (newState: Partial<CheckoutState>) => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  couponDiscount: number;
  totalAfterDiscount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialCheckoutState: CheckoutState = {
  shippingAddress: null,
  paymentMethod: null,
};


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) setCartItems(JSON.parse(storedCart));
        
        const storedCheckoutState = localStorage.getItem('checkoutState');
        if (storedCheckoutState) setCheckoutState(JSON.parse(storedCheckoutState));

        const storedCoupon = localStorage.getItem('coupon');
        if (storedCoupon) {
            const parsedCoupon = JSON.parse(storedCoupon);
            // Firestore Timestamps are not plain objects, need to convert them back
            if (parsedCoupon.startDate?.seconds && parsedCoupon.endDate?.seconds) {
              setCoupon({
                  ...parsedCoupon,
                  startDate: new Timestamp(parsedCoupon.startDate.seconds, parsedCoupon.startDate.nanoseconds),
                  endDate: new Timestamp(parsedCoupon.endDate.seconds, parsedCoupon.endDate.nanoseconds),
              });
            }
        }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.clear();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('checkoutState', JSON.stringify(checkoutState));
  }, [checkoutState]);
  
   useEffect(() => {
    if (coupon) {
      localStorage.setItem('coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('coupon');
    }
  }, [coupon]);


  const handleSetCheckoutState = (newState: Partial<CheckoutState>) => {
    setCheckoutState(prevState => ({...prevState, ...newState}));
  }

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
    toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        className: 'bg-accent text-accent-foreground border-accent',
        icon: <CheckCircle className="h-5 w-5" />,
    })
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const applyCoupon = async (code: string) => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Could not connect to the database." });
        return;
    }
    const couponsRef = collection(firestore, 'coupons');
    const q = query(couponsRef, where("code", "==", code.toUpperCase()));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            toast({ variant: "destructive", title: "Invalid Coupon", description: "This coupon code does not exist." });
            return;
        }

        const couponDoc = querySnapshot.docs[0];
        const couponData = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
        
        const now = new Date();
        if (couponData.startDate.toDate() > now) {
            toast({ variant: "destructive", title: "Coupon Not Yet Active", description: "This coupon is not valid yet." });
            return;
        }
        if (couponData.endDate.toDate() < now) {
            toast({ variant: "destructive", title: "Coupon Expired", description: "This coupon has expired." });
            return;
        }

        if (couponData.usageLimit > 0 && couponData.timesUsed >= couponData.usageLimit) {
            toast({ variant: "destructive", title: "Coupon Limit Reached", description: "This coupon has been fully used." });
            return;
        }

        const currentCartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
        if ((couponData.minimumOrderValue || 0) > 0 && currentCartTotal < couponData.minimumOrderValue!) {
            toast({ variant: "destructive", title: "Minimum Order Value Not Met", description: `You need to spend at least $${couponData.minimumOrderValue} to use this coupon.` });
            return;
        }
        
        const currentCartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        if ((couponData.minimumItemCount || 0) > 0 && currentCartCount < couponData.minimumItemCount!) {
            toast({ variant: "destructive", title: "Minimum Item Count Not Met", description: `You need at least ${couponData.minimumItemCount} items in your cart to use this coupon.` });
            return;
        }

        setCoupon(couponData);
        toast({
            title: "Coupon Applied!",
            description: `You've got a ${couponData.discountPercentage}% discount.`,
            className: 'bg-green-600 border-green-600 text-white',
            icon: <CheckCircle className="h-5 w-5" />
        });
    } catch (error) {
        console.error("Error applying coupon:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not apply the coupon." });
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast({
        title: "Coupon Removed",
        icon: <XCircle className="h-5 w-5 text-destructive" />,
    });
  }

  const clearCart = () => {
    setCartItems([]);
    setCheckoutState(initialCheckoutState);
    setCoupon(null);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('checkoutState');
    localStorage.removeItem('coupon');
  };
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  
  let couponDiscount = 0;
  if (coupon) {
      const applicableItems = coupon.applicableProductIds && coupon.applicableProductIds.length > 0
          ? cartItems.filter(item => coupon.applicableProductIds.includes(item.product.id))
          : cartItems;

      const applicableTotal = applicableItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
      couponDiscount = (applicableTotal * coupon.discountPercentage) / 100;
  }
  
  const totalAfterDiscount = cartTotal - couponDiscount;


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        checkoutState,
        setCheckoutState: handleSetCheckoutState,
        coupon,
        applyCoupon,
        removeCoupon,
        couponDiscount,
        totalAfterDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

    