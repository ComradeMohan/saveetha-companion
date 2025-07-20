
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
import { collection, getDocs, query as firestoreQuery, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConceptMap } from '@/lib/concept-map-data';

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

const conceptMapSearchTool = ai.defineTool(
  {
    name: 'conceptMapSearch',
    description: 'Searches for concept maps related to a given query.',
    inputSchema: z.object({
      query: z.string().describe('The search query for concept maps.'),
    }),
    outputSchema: z.array(ConceptMapSchema),
  },
  async (input) => {
    // Fetch concept maps from Firestore
    console.log('Searching Firestore for concept maps with query:', input.query);
    const mapsRef = collection(db, 'concept-maps');

    // Note: Firestore doesn't support full-text search natively.
    // This is a simple implementation. For more advanced search,
    // consider a third-party service like Algolia or Elasticsearch.
    // Here, we're just fetching a few and letting the LLM do the filtering.
    const q = firestoreQuery(mapsRef, limit(20));

    const querySnapshot = await getDocs(q);
    const maps: ConceptMap[] = [];
    querySnapshot.forEach((doc) => {
        maps.push({ id: doc.id, ...doc.data() } as ConceptMap);
    });
    
    console.log(`Found ${maps.length} maps in Firestore.`);
    
    // Return a subset of properties matching the schema
    return maps.map(m => ({
        title: m.title,
        url: m.url,
        description: m.description,
    }));
  }
);


const prompt = ai.definePrompt({
  name: 'conceptMapFinderPrompt',
  input: {schema: z.object({ query: z.string() })},
  output: {schema: ConceptMapFinderOutputSchema},
  tools: [conceptMapSearchTool],
  prompt: `You are an AI assistant helping students find relevant concept maps.
The student will provide a search query.
1. Use the conceptMapSearch tool to get a list of available concept maps.
2. From that list, select up to 6 of the most relevant concept maps that best match the student's query.
3. Return only the concept maps that you have selected.

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
