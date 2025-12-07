
"use server";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-product-recommendations";
import { findGift, type GiftFinderInput } from "@/ai/flows/gift-finder-flow";
import type { Product, Order } from "./types";

// This file is kept for server-side AI actions.
// Order placement has been moved to the client-side to avoid Firebase Admin SDK dependency in deployment environments like Vercel.

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
