
'use server';
/**
 * @fileOverview An AI tutor that can answer questions about all concept maps.
 *
 * - askTutor - A function that handles the tutoring process.
 * - TutorInput - The input type for the askTutor function.
 * - TutorOutput - The return type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConceptMap } from '@/lib/concept-map-data';
import pdf from 'pdf-parse';


// Define Zod schemas for input and output
const TutorInputSchema = z.object({
  question: z.string().describe('The question from the user.'),
});
export type TutorInput = z.infer<typeof TutorInputSchema>;

const TutorOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer.'),
  sources: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
  })).describe('A list of source documents used to generate the answer.'),
});
export type TutorOutput = z.infer<typeof TutorOutputSchema>;


// Exported wrapper function to be called from the UI
export async function askTutor(input: TutorInput): Promise<TutorOutput> {
  return tutorFlow(input);
}


// In-memory cache for PDF content to avoid re-fetching on every call
const pdfCache = new Map<string, string>();

async function getPdfContent(url: string): Promise<string> {
    if (pdfCache.has(url)) {
        return pdfCache.get(url)!;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        const data = await pdf(buffer);
        pdfCache.set(url, data.text);
        return data.text;
    } catch (error) {
        console.error(`Error processing PDF from ${url}:`, error);
        return ''; // Return empty string on error
    }
}

// Tool to get all concept maps from Firestore
const getAllConceptMapsTool = ai.defineTool(
    {
        name: 'getAllConceptMaps',
        description: 'Retrieves a list of all available concept maps from the database.',
        inputSchema: z.void(),
        outputSchema: z.array(z.object({
            title: z.string(),
            url: z.string().url(),
        })),
    },
    async () => {
        const querySnapshot = await getDocs(collection(db, 'concept-maps'));
        const maps: ConceptMap[] = [];
        querySnapshot.forEach((doc) => {
            maps.push({ id: doc.id, ...doc.data() } as ConceptMap);
        });
        return maps.map(m => ({ title: m.title, url: m.url }));
    }
);


const prompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: TutorInputSchema },
  output: { schema: TutorOutputSchema },
  tools: [getAllConceptMapsTool],
  prompt: `You are an expert academic tutor for college students. Your knowledge base consists of a set of concept maps.
A student will ask you a question. Your task is to provide a clear, concise, and helpful answer based *only* on the content of the provided documents.

Follow these steps:
1.  Use the 'getAllConceptMaps' tool to get a list of all available concept maps.
2.  From this list, identify which concept maps are most relevant to the user's question. This is a critical step. Focus on titles and likely content.
3.  For each of the most relevant documents you identified, the full text content will be provided below under the 'DOCUMENTS' section.
4.  Synthesize the information from the provided document content to formulate your answer.
5.  **IMPORTANT:** Do not use any external knowledge. If the answer cannot be found in the documents, state that clearly. For example: "I could not find information about that topic in the available concept maps."
6.  List the exact titles and URLs of the documents you used to formulate your answer in the 'sources' output field.

User Question: {{{question}}}

DOCUMENTS:
{{#if tool_response.getAllConceptMaps}}
  {{#each tool_response.getAllConceptMaps}}
---
Document Title: {{this.title}}
Document URL: {{this.url}}
Content:
{{{embed "text" (get "this.url")}}}
---
  {{/each}}
{{/if}}
`,
});

const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
      
    const llmResponse = await prompt(input, {
        embedder: (url: string) => ({
            content: () => getPdfContent(url),
        }),
    });

    return llmResponse.output!;
  }
);
