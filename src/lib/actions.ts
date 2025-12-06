
"use server";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-product-recommendations";
import { findGift, type GiftFinderInput } from "@/ai/flows/gift-finder-flow";
import type { Product, Order, Coupon } from "./types";
import { firestore } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// This should ideally be done once.
if (!getApps().length) {
    try {
        // When running on Google Cloud, credentials will be automatically discovered.
        initializeApp();
    } catch (e) {
        // For local development, you might need a service account key.
        // Make sure to not commit the service account key to your repository.
        console.warn("Firebase Admin SDK not initialized. This is expected in local dev without a service account key. Some server actions may fail.");
    }
}

const db = getFirestore();

async function getAllProducts(): Promise<Product[]> {
    try {
        const productsSnapshot = await db.collection('products').get();
        return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Failed to fetch all products on server:", error);
        return [];
    }
}


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
  coupon: Coupon | null
): Promise<{ orderId?: string; error?: string }> {
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
    if (coupon) {
      const couponRef = db.collection('coupons').doc(coupon.id);
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
