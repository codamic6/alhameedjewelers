'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from './use-toast';
import { CheckCircle } from 'lucide-react';

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
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialCheckoutState: CheckoutState = {
  shippingAddress: null,
  paymentMethod: null,
};


export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialCheckoutState);
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
        const storedCheckoutState = localStorage.getItem('checkoutState');
        if (storedCheckoutState) {
            setCheckoutState(JSON.parse(storedCheckoutState));
        }
    } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.removeItem('cartItems');
        localStorage.removeItem('checkoutState');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('checkoutState', JSON.stringify(checkoutState));
  }, [checkoutState]);

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

  const clearCart = () => {
    setCartItems([]);
    setCheckoutState(initialCheckoutState);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('checkoutState');
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

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
