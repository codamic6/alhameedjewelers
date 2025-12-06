
"use server";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-product-recommendations";
import { findGift, type GiftFinderInput } from "@/ai/flows/gift-finder-flow";
import type { Product, Order } from "./types";
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export async function getAIRecommendations(browsingHistory: string[]) {
  try {
    const history = browsingHistory.join(', ');
    const goldPrice = 65.50; // Mock current gold price in USD per gram

    const recommendations = await getPersonalizedRecommendations({
      browsingHistory: history || 'new user',
      goldPrice: goldPrice,
    });
    
    return recommendations;
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    return { recommendations: [] };
  }
}

export async function getAIGiftRecommendations(
  userInput: Omit<GiftFinderInput, 'allProducts'>,
  allProducts: Product[]
) {
  try {
    const result = await findGift({
      ...userInput,
      allProducts: allProducts.map(({ id, name, description, category, price }) => ({
        id, name, description, category, price
      })),
    });
    return result;
  } catch (error) {
    console.error("Error getting AI gift recommendations:", error);
    throw new Error("Failed to get gift recommendations from AI.");
  }
}


export async function placeOrder(
  orderData: Omit<Order, 'id' | 'orderDate'>,
  couponId: string | null
): Promise<{ orderId?: string; error?: string }> {
  
  // For local development, Firebase Admin SDK will fail without credentials.
  // We bypass the logic and return a dummy success response to allow UI testing.
  if (process.env.NODE_ENV !== 'production') {
    console.log("Local development: Skipping Firebase Admin action. Returning dummy order ID.");
    return { orderId: `local-dev-${Date.now().toString().slice(-6)}` };
  }

  // --- Production Logic ---
  // Initialize admin SDK only when needed and in a production environment.
  if (!getApps().length) {
    try {
      initializeApp();
    } catch (e) {
      const errorMessage = "Order placement failed: Firebase Admin SDK could not be initialized on the server.";
      console.error(errorMessage, e);
      return { error: errorMessage };
    }
  }

  const db = getFirestore();

  try {
    const finalOrderData = {
      ...orderData,
      orderDate: FieldValue.serverTimestamp(),
    };

    const batch = db.batch();

    // 1. Create the new order document
    const orderRef = db.collection('orders').doc();
    batch.set(orderRef, finalOrderData);

    // 2. If a coupon was used, increment its usage count
    if (couponId) {
      const couponRef = db.collection('coupons').doc(couponId);
      batch.update(couponRef, { timesUsed: FieldValue.increment(1) });
    }

    // Commit the batch
    await batch.commit();

    return { orderId: orderRef.id };
  } catch (error: any) {
    console.error('Error placing order:', error);
    return { error: error.message || 'An unknown error occurred while placing the order.' };
  }
}
