'use server';
/**
 * @fileOverview A gift recommendation AI agent.
 *
 * - findGift - A function that handles the gift finding process.
 * - GiftFinderInput - The input type for the findGift function.
 * - GiftFinderOutput - The return type for the findGift function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Product } from '@/lib/types';

const GiftFinderInputSchema = z.object({
  recipient: z.string().describe('Who the gift is for (e.g., wife, mother, friend).'),
  occasion: z.string().describe('The special occasion for the gift (e.g., anniversary, birthday).'),
  style: z.string().describe("The recipient's preferred style (e.g., modern, classic, elegant)."),
  allProducts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      category: z.string(),
      price: z.number(),
    })
  ).describe('A list of all available products in the store.'),
});
export type GiftFinderInput = z.infer<typeof GiftFinderInputSchema>;

const GiftFinderOutputSchema = z.object({
  recommendations: z
    .array(z.object({
        productId: z.string().describe('The ID of the recommended product.'),
        reason: z.string().describe('A short, friendly reason why this product is a good match.')
    }))
    .describe('A list of up to 4 personalized jewelry recommendations.'),
    introductoryText: z.string().describe('A friendly, short introductory message to the user presenting the recommendations. Example: "Based on your choices, here are a few beautiful gifts she might love!"')
});
export type GiftFinderOutput = z.infer<typeof GiftFinderOutputSchema>;

export async function findGift(input: GiftFinderInput): Promise<GiftFinderOutput> {
  return giftFinderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'giftFinderPrompt',
  input: { schema: GiftFinderInputSchema },
  output: { schema: GiftFinderOutputSchema },
  prompt: `You are a friendly and expert personal shopper for a luxury jewelry store called "Al-Hameed Jewelers".
  A customer is looking for a gift. Their preferences are:
  - Gift for: {{{recipient}}}
  - Occasion: {{{occasion}}}
  - Preferred Style: {{{style}}}

  Here is the list of all available products in the store:
  {{#each allProducts}}
  - Product ID: {{id}}, Name: {{name}}, Description: {{description}}, Category: {{category}}, Price: {{price}}
  {{/each}}

  Your task is to:
  1.  Analyze the user's preferences and the product list.
  2.  Select up to 4 of the best matching products from the list.
  3.  For each selected product, provide its ID and write a short, friendly, one-sentence reason why it's a great choice for the given occasion and recipient.
  4.  Write a warm, single-sentence introductory text to present your recommendations to the user.
  
  Provide the output in the specified JSON format.`,
});

const giftFinderFlow = ai.defineFlow(
  {
    name: 'giftFinderFlow',
    inputSchema: GiftFinderInputSchema,
    outputSchema: GiftFinderOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
