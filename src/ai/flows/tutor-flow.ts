
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
import { conceptMapSearchTool } from './concept-map-finder';
import { pdfCache } from './knowledge-feeder'; // Import the shared cache


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


async function getCachedPdfContent(url: string): Promise<string> {
    if (pdfCache.has(url)) {
        return pdfCache.get(url)!;
    }
    // If not in cache, return an empty string or a message indicating it needs to be fed.
    // The "Feed Knowledge" flow is responsible for populating the cache.
    console.warn(`PDF content for ${url} not found in cache. Please run the knowledge feeder.`);
    return `Content for this document is not currently in memory. An administrator may need to re-feed the knowledge base.`;
}


const prompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: TutorInputSchema },
  output: { schema: TutorOutputSchema },
  tools: [conceptMapSearchTool],
  prompt: `You are an expert academic tutor for college students. Your knowledge base consists of a set of concept maps.
A student will ask you a question. Your task is to provide a clear, concise, and helpful answer based *only* on the content of the provided documents.

Follow these steps:
1.  Use the 'conceptMapSearch' tool with the user's question as the query to find a list of relevant concept maps.
2.  The full text content for each of the documents returned by the tool will be provided below under the 'DOCUMENTS' section.
3.  Synthesize the information from the provided document content to formulate your answer.
4.  **IMPORTANT:** Do not use any external knowledge. If the answer cannot be found in the documents, state that clearly. For example: "I could not find information about that topic in the available concept maps."
5.  List the exact titles and URLs of the documents you used to formulate your answer in the 'sources' output field.

User Question: {{{question}}}

DOCUMENTS:
{{#if tool_response.conceptMapSearch}}
  {{#each tool_response.conceptMapSearch}}
---
Document Title: {{this.title}}
Document URL: {{this.url}}
Content:
{{{embed "text" this.url}}}
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
        embedder: async (url: string) => ({
            content: await getCachedPdfContent(url),
        }),
    });
    
    // Ensure the output includes sources, even if the LLM forgets.
    const output = llmResponse.output!;
    if (llmResponse.history && llmResponse.history.length > 0) {
      const toolResponse = llmResponse.history[0].toolResponse[0]?.output;
      if (Array.isArray(toolResponse) && toolResponse.length > 0) {
        // If the LLM didn't populate sources, do it from the tool response
        if (!output.sources || output.sources.length === 0) {
           output.sources = toolResponse.map(doc => ({ title: doc.title, url: doc.url }));
        }
      }
    }

    return output;
  }
);
