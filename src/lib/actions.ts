"use server";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-product-recommendations";
import { findGift, type GiftFinderInput } from "@/ai/flows/gift-finder-flow";
import type { Product } from "./types";
import { firestore } from 'firebase-admin';

async function getAllProducts(): Promise<Product[]> {
    try {
        // This is a server-side fetch. For a real app, you might use the Firebase Admin SDK
        // but for this prototype, we are using a simplified fetch which might not work in production
        // without proper setup. For now, we are assuming a simple public API or direct DB access on server.
        // A more robust solution would be to use the Firebase Admin SDK.
        
        // This is a placeholder. In a real app with Admin SDK:
        // const db = firestore();
        // const productsSnapshot = await db.collection('products').get();
        // return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        // For this prototype, we'll return an empty array if not in a proper server env.
        // The UI will pass the products client-side as a fallback.
        return [];
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
