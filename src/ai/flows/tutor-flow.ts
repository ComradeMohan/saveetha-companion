
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
import { getPdfContent } from './knowledge-feeder'; 


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

// Helper to create the dynamic prompt content
async function buildPromptContent(documents: Array<{ title: string; url: string }>): Promise<string> {
  let content = '';
  for (const doc of documents) {
    const pdfText = await getPdfContent(doc.url);
    if (pdfText) {
      content += `---
Document Title: ${doc.title}
Document URL: ${doc.url}
Content:
${pdfText.substring(0, 8000)} 
---
`;
    }
  }
  return content;
}

const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    // 1. Use the tool to find relevant documents
    const relevantDocs = await conceptMapSearchTool({ query: input.question });

    if (!relevantDocs || relevantDocs.length === 0) {
      return {
        answer: "I couldn't find any relevant concept maps for your question. Please try a different query or make sure you have fed the AI the necessary knowledge.",
        sources: [],
      };
    }
    
    // 2. Build the dynamic content for the prompt by fetching PDF content
    const documentsContent = await buildPromptContent(relevantDocs);

    // 3. Define the final prompt with the fetched content
    const finalPrompt = `You are an expert academic tutor for college students. Your knowledge base consists of a set of concept maps.
A student will ask you a question. Your task is to provide a clear, concise, and helpful answer based *only* on the content of the provided documents.

Follow these steps:
1.  Synthesize the information from the provided document content to formulate your answer.
2.  **IMPORTANT:** Do not use any external knowledge. If the answer cannot be found in the documents, state that clearly. For example: "I could not find information about that topic in the available concept maps."
3.  List the exact titles and URLs of the documents you used to formulate your answer in the 'sources' output field.

User Question: ${input.question}

DOCUMENTS:
${documentsContent}
`;

    // 4. Generate the response
    const { output } = await ai.generate({
      prompt: finalPrompt,
      output: { schema: TutorOutputSchema },
    });

    // Ensure the output includes sources, even if the LLM forgets.
    const finalOutput = output!;
    if ((!finalOutput.sources || finalOutput.sources.length === 0) && relevantDocs.length > 0) {
      finalOutput.sources = relevantDocs.map(doc => ({ title: doc.title, url: doc.url }));
    }

    return finalOutput;
  }
);
