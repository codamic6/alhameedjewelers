import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({projectId: 'al-hameed-jewelers-ac175'})],
  model: 'googleai/gemini-2.5-flash',
});
