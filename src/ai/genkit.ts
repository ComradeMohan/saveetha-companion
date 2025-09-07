
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyBhdFYEbzVIWu3Gw49lqIvFUiEyzTs1ha4'})],
  model: 'googleai/gemini-2.0-flash',
});
