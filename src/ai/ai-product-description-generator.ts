
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating product descriptions using AI.
 *
 * The flow takes product details as input and returns an engaging product description.
 *
 * @exports {
 *   generateProductDescription,
 *   AIProductDescriptionInput,
 *   AIProductDescriptionOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product (e.g., necklace, ring, bracelet).'),
  productMaterial: z.string().describe('The primary material of the product (e.g., gold, silver, platinum).'),
  productStyle: z.string().describe('The style of the product (e.g., modern, classic, vintage).'),
  productFeatures: z.string().describe('Key features and characteristics of the product.'),
  goldPrice: z.number().describe('Current price of gold per gram in USD.'),
});
export type AIProductDescriptionInput = z.infer<typeof AIProductDescriptionInputSchema>;

const AIProductDescriptionOutputSchema = z.object({
  description: z.string().describe('An engaging and informative product description.'),
});
export type AIProductDescriptionOutput = z.infer<typeof AIProductDescriptionOutputSchema>;

export async function generateProductDescription(input: AIProductDescriptionInput): Promise<AIProductDescriptionOutput> {
  return aiProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProductDescriptionPrompt',
  input: {schema: AIProductDescriptionInputSchema},
  output: {schema: AIProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in crafting engaging product descriptions for luxury jewelry.

  Given the following product details, create a compelling and informative description that highlights the product's unique features and appeals to discerning customers.
  Consider the current gold price when mentioning the product's value.

  Product Name: {{{productName}}}
  Category: {{{productCategory}}}
  Material: {{{productMaterial}}}
  Style: {{{productStyle}}}
  Features: {{{productFeatures}}}
  Current Gold Price (per gram): {{{goldPrice}}}

  Description:`, // Ensure that 'Description:' is present at the end.
});

const aiProductDescriptionFlow = ai.defineFlow(
  {
    name: 'aiProductDescriptionFlow',
    inputSchema: AIProductDescriptionInputSchema,
    outputSchema: AIProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
