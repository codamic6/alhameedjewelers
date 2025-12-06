import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({projectId: process.env.GENKIT_PROJECT_ID})],
  model: 'googleai/gemini-2.5-flash',
});
