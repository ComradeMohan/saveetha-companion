'use server';

/**
 * @fileOverview A concept map finder AI agent.
 *
 * - conceptMapFinder - A function that handles the concept map finding process.
 * - ConceptMapFinderInput - The input type for the conceptMapFinder function.
 * - ConceptMapFinderOutput - The return type for the conceptMapFinder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConceptMapFinderInputSchema = z.object({
  query: z.string().describe('The search query for the concept map.'),
});
export type ConceptMapFinderInput = z.infer<typeof ConceptMapFinderInputSchema>;

const ConceptMapSchema = z.object({
  title: z.string().describe('The title of the concept map.'),
  url: z.string().url().describe('The URL of the concept map image.'),
  description: z.string().describe('A brief description of the concept map.'),
});

const ConceptMapFinderOutputSchema = z.array(ConceptMapSchema).describe('An array of relevant concept maps.');
export type ConceptMapFinderOutput = z.infer<typeof ConceptMapFinderOutputSchema>;

export async function conceptMapFinder(input: ConceptMapFinderInput): Promise<ConceptMapFinderOutput> {
  return conceptMapFinderFlow(input);
}

const conceptMapSearchTool = ai.defineTool({
  name: 'conceptMapSearch',
  description: 'Searches for concept maps related to a given query.',
  inputSchema: z.object({
    query: z.string().describe('The search query for concept maps.'),
  }),
  outputSchema: z.array(ConceptMapSchema),
  async fn(input) {
    // TODO: Implement the actual concept map search logic here.
    // This is a placeholder that returns dummy data.
    // Replace this with a real implementation that searches a database or external API.
    return [
      {
        title: 'Example Concept Map 1',
        url: 'https://example.com/concept-map-1.png',
        description: 'A concept map about example topic 1.',
      },
      {
        title: 'Example Concept Map 2',
        url: 'https://example.com/concept-map-2.png',
        description: 'A concept map about example topic 2.',
      },
    ];
  },
});

const prompt = ai.definePrompt({
  name: 'conceptMapFinderPrompt',
  input: {schema: ConceptMapFinderInputSchema},
  output: {schema: ConceptMapFinderOutputSchema},
  tools: [conceptMapSearchTool],
  prompt: `You are an AI assistant helping students find relevant concept maps.
  The student will provide a search query, and you should use the conceptMapSearch tool to find relevant concept maps.
  Return the concept maps found by the tool.
  
  Query: {{{query}}}`,
});

const conceptMapFinderFlow = ai.defineFlow(
  {
    name: 'conceptMapFinderFlow',
    inputSchema: ConceptMapFinderInputSchema,
    outputSchema: ConceptMapFinderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
