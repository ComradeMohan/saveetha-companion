
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
import { getPdfContent } from './knowledge-feeder'; 
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConceptMap } from '@/lib/concept-map-data';

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
    // 1. Fetch ALL documents from Firestore to build context.
    const mapsRef = collection(db, 'concept-maps');
    const querySnapshot = await getDocs(mapsRef);
    const allDocs: ConceptMap[] = [];
    querySnapshot.forEach((doc) => {
        allDocs.push({ id: doc.id, ...doc.data() } as ConceptMap);
    });

    if (!allDocs || allDocs.length === 0) {
      return {
        answer: "I couldn't find any concept maps in the knowledge base. Please ask an administrator to add some.",
        sources: [],
      };
    }
    
    // 2. Build the dynamic content for the prompt by fetching PDF content
    const documentsContent = await buildPromptContent(allDocs);

    // 3. Define the final prompt with the fetched content
    const finalPrompt = `You are an expert academic tutor for college students. Your knowledge base consists of a set of concept maps.
A student will ask you a question. Your task is to provide a clear, concise, and helpful answer based *only* on the content of the provided documents.

Follow these steps:
1.  Read the user's question and all the provided document content.
2.  Synthesize the information from ALL documents to formulate your answer.
3.  **IMPORTANT:** Do not use any external knowledge. If the answer cannot be found in the documents, state that clearly. For example: "I could not find information about that topic in the available concept maps."
4.  After providing the answer, you **MUST** list the exact titles and URLs of the specific documents you used to formulate your answer in the 'sources' output field. Only list the documents that were actually relevant to your answer.

User Question: ${input.question}

AVAILABLE DOCUMENTS:
${documentsContent}
`;

    // 4. Generate the response
    const { output } = await ai.generate({
      prompt: finalPrompt,
      output: { schema: TutorOutputSchema },
    });
    
    return output!;
  }
);
