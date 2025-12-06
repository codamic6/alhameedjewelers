'use server';
/**
 * @fileOverview A Genkit flow for virtually trying on jewelry.
 *
 * - virtualTryOn - A function that takes a user's hand image and a product image and returns an image of the product on the hand.
 * - VirtualTryOnInput - The input type for the virtualTryOn function.
 * - VirtualTryOnOutput - The return type for the virtualTryOn function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const VirtualTryOnInputSchema = z.object({
  userImage: z
    .string()
    .describe(
      "The user's image (e.g., of their hand), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productImage: z
    .string()
    .describe(
      "The product image (e.g., a ring), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productCategory: z
    .string()
    .describe('The category of the product, e.g., Ring, Bracelet, Necklace.')
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

export const VirtualTryOnOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe(
      "The generated image of the product on the user, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function virtualTryOn(input: VirtualTryOnInput): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

const tryOnPrompt = `
You are a master photo editor specializing in virtual jewelry try-on.
Your task is to take a product image and a user's image (e.g., a hand, wrist, or neck) and create a new, photorealistic image showing the product worn by the user.

- Analyze the product image to understand the jewelry item.
- Analyze the user's image to understand the body part.
- Based on the product category ('{{{productCategory}}}'), place the jewelry on the appropriate part of the user's image. For a 'Ring', place it on the ring finger. For a 'Bracelet', place it on the wrist.
- Realistically adjust the jewelry's size, angle, lighting, and shadows to perfectly match the user's photo.
- The output should ONLY be the final, edited image. Do not include any text or other elements.
`;


const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: input.userImage } },
            { media: { url: input.productImage } },
            { text: tryOnPrompt },
        ],
        config: {
            responseModalities: ['IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error('Image generation failed or returned no media.');
    }

    return { generatedImage: media.url };
  }
);
