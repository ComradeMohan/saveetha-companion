
'use server';

/**
 * @fileOverview A flow to feed PDF knowledge into an in-memory cache.
 *
 * - feedKnowledge - A function that fetches, parses, and caches PDF content.
 * - KnowledgeFeederInput - The input type for the feedKnowledge function.
 * - getPdfContent - An exported function to retrieve cached PDF content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import pdf from 'pdf-parse';

// In-memory cache for PDF content to avoid re-fetching on every call
// This is NOT exported directly to comply with 'use server' constraints.
const pdfCache = new Map<string, string>();

export async function getPdfContent(url: string): Promise<string> {
    if (pdfCache.has(url)) {
        console.log(`[Cache] HIT for ${url}`);
        return pdfCache.get(url)!;
    }
    console.log(`[Cache] MISS for ${url}. Fetching and parsing.`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const data = await pdf(buffer);
        
        // Don't cache empty results to allow for retries
        if(data.text) {
          pdfCache.set(url, data.text);
        }
        return data.text;
    } catch (error) {
        console.error(`Error processing PDF from ${url}:`, error);
        return ''; // Return empty string on error
    }
}


const KnowledgeFeederInputSchema = z.object({
  url: z.string().url().describe('The URL of the PDF to feed into the knowledge base.'),
});
export type KnowledgeFeederInput = z.infer<typeof KnowledgeFeederInputSchema>;

const KnowledgeFeederOutputSchema = z.object({
  status: z.enum(['success', 'error']),
  message: z.string(),
});


export async function feedKnowledge(input: KnowledgeFeederInput): Promise<void> {
    // This wrapper calls the flow. The UI doesn't need a complex return value.
    await knowledgeFeederFlow(input);
}

const knowledgeFeederFlow = ai.defineFlow(
  {
    name: 'knowledgeFeederFlow',
    inputSchema: KnowledgeFeederInputSchema,
    outputSchema: KnowledgeFeederOutputSchema,
  },
  async (input) => {
    try {
      console.log(`Feeding knowledge from: ${input.url}`);
      await getPdfContent(input.url);
      console.log(`Successfully fed and cached: ${input.url}`);
      return {
        status: 'success',
        message: `Successfully fed and cached content from ${input.url}`,
      };
    } catch (error: any) {
        console.error(`Failed to feed knowledge from ${input.url}:`, error);
        return {
            status: 'error',
            message: `Failed to feed knowledge: ${error.message || 'Unknown error'}`,
        }
    }
  }
);
