
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
      query: z.string().describe('The search query for a concept map.'),
    }),
    outputSchema: z.array(ConceptMapSchema),
  },
  async (input) => {
    // Fetch concept maps from Firestore
    console.log('Searching Firestore for concept maps with query:', input.query);
    const mapsRef = collection(db, 'concept-maps');

    // Note: Firestore doesn't support full-text search natively.
    // We fetch all documents and filter them in memory.
    // For large datasets, a dedicated search service like Algolia or Elasticsearch is recommended.
    const querySnapshot = await getDocs(mapsRef);
    const allMaps: ConceptMap[] = [];
    querySnapshot.forEach((doc) => {
        allMaps.push({ id: doc.id, ...doc.data() } as ConceptMap);
    });

    console.log(`Fetched ${allMaps.length} total maps from Firestore.`);

    // Filter the maps based on the query
    const lowercasedQuery = input.query.toLowerCase();
    const filteredMaps = allMaps.filter(map => 
        map.title.toLowerCase().includes(lowercasedQuery)
    );
    
    console.log(`Found ${filteredMaps.length} maps matching the query.`);
    
    // Return a subset of properties matching the schema
    return filteredMaps.map(m => ({
        title: m.title,
        url: m.url,
        description: m.description || `A concept map about ${m.title}`, // Provide a fallback description
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
1. Use the conceptMapSearch tool with the student's query to get a list of relevant concept maps. The tool has already filtered the maps.
2. From that list, select up to 6 of the best concept maps. For each map, provide a very brief, one-sentence description based on its title if one isn't provided.
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
