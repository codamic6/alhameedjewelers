'use server';
/**
 * @fileOverview This file implements the personalized product recommendations flow.
 *
 * The flow takes user browsing history and current gold price into account to provide
 * personalized jewelry recommendations.
 *
 * @exported
 * - `getPersonalizedRecommendations`: An async function that takes `RecommendationInput` and returns `RecommendationOutput`.
 * @exported
 * - `RecommendationInput`: Zod schema and Typescript type for input.
 * @exported
 * - `RecommendationOutput`: Zod schema and Typescript type for output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationInputSchema = z.object({
  browsingHistory: z
    .string()
    .describe('A summary of the user browsing history on the jewelry website.'),
  goldPrice: z.number().describe('The current price of gold in USD per gram.'),
});
export type RecommendationInput = z.infer<typeof RecommendationInputSchema>;

const RecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of personalized jewelry recommendations.'),
});
export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;

export async function getPersonalizedRecommendations(
  input: RecommendationInput
): Promise<RecommendationOutput> {
  return personalizedRecommendationsFlow(input);
}

const productRecommendationPrompt = ai.definePrompt({
  name: 'productRecommendationPrompt',
  input: {schema: RecommendationInputSchema},
  output: {schema: RecommendationOutputSchema},
  prompt: `You are an expert jewelry recommendation system. Based on the user's browsing history and the current price of gold, you will provide personalized jewelry recommendations.

User Browsing History: {{{browsingHistory}}}
Current Gold Price (USD per gram): {{{goldPrice}}}

Consider the browsing history to understand the user's taste and preferences. Take into account the current gold price to recommend jewelry that fits their budget.

Recommendations:`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: RecommendationInputSchema,
    outputSchema: RecommendationOutputSchema,
  },
  async input => {
    const {output} = await productRecommendationPrompt(input);
    return output!;
  }
);
