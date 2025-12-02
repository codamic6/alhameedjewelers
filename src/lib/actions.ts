"use server";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-product-recommendations";

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
