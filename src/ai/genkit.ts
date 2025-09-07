
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyBhdFYEbzVIWu3Gw49lqIvFUiEyzTs1ha4'})],
});
