
'use server';

/**
 * @fileOverview A flow to feed PDF knowledge into a persistent Firestore cache.
 *
 * - feedKnowledge - A function that fetches, parses, and caches PDF content into Firestore.
 * - KnowledgeFeederInput - The input type for the feedKnowledge function.
 * - getPdfContent - An exported function to retrieve cached PDF content from Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import pdf from 'pdf-parse';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper to create a safe document ID from a URL
const urlToDocId = (url: string) => encodeURIComponent(url);

/**
 * Retrieves PDF content. It first checks a persistent Firestore cache.
 * If not found, it fetches the PDF, parses it, and stores the content
 * in the cache for future use.
 * @param url The URL of the PDF to retrieve.
 * @returns The text content of the PDF.
 */
export async function getPdfContent(url:string): Promise<string> {
    const docId = urlToDocId(url);
    const cacheRef = doc(db, 'pdf-knowledge-cache', docId);

    try {
        const docSnap = await getDoc(cacheRef);
        if (docSnap.exists()) {
            console.log(`[Cache] FIRESTORE HIT for ${url}`);
            return docSnap.data().content;
        }
    } catch (e) {
        console.error("Firestore cache read failed, proceeding to fetch.", e);
    }
    
    console.log(`[Cache] MISS for ${url}. Fetching, parsing, and caching.`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const data = await pdf(buffer);
        
        if (data.text) {
          await setDoc(cacheRef, { content: data.text, cachedAt: new Date().toISOString() });
          console.log(`[Cache] Stored ${data.text.length} characters in Firestore for ${url}`);
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
      // This will fetch, parse, and store the content in the Firestore cache.
      const content = await getPdfContent(input.url);
      if (!content) {
        throw new Error("Extracted PDF content was empty.");
      }
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
