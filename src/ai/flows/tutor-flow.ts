
'use server';
/**
 * @fileOverview An AI tutor that answers questions based on a knowledge base of documents.
 *
 * - askTutor - A function that handles the tutoring process using a RAG pipeline.
 * - TutorInput - The input type for the askTutor function.
 * - TutorOutput - The return type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  })).optional().describe('A list of source documents used to generate the answer.'),
});
export type TutorOutput = z.infer<typeof TutorOutputSchema>;


// Exported wrapper function to be called from the UI
export async function askTutor(input: TutorInput): Promise<TutorOutput> {
  return tutorFlow(input);
}

// Helper to get all concept map documents from Firestore
async function getKnowledgeDocuments(): Promise<{ title: string; url: string }[]> {
    try {
        const snapshot = await getDocs(collection(db, 'concept-maps'));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            title: doc.data().title,
            url: doc.data().url,
        }));
    } catch (error) {
        console.error("Error fetching documents from Firestore:", error);
        return [];
    }
}


const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    // 1. Fetch all available documents from our knowledge base
    const docs = await getKnowledgeDocuments();
    
    if (docs.length === 0) {
      return { 
        answer: "I don't have any knowledge documents to reference. An administrator needs to add and feed concept map PDFs in the admin panel."
      };
    }
    
    // 2. Fetch the text content of each document
    const knowledge = await Promise.all(
        docs.map(async (doc) => {
            const content = await getPdfContent(doc.url);
            return {
                title: doc.title,
                url: doc.url,
                content: content.substring(0, 100000), // Truncate to prevent excessive context
            };
        })
    );
    
    const knowledgeBaseText = knowledge
        .map(k => `## Document: ${k.title}\nURL: ${k.url}\nContent:\n${k.content}\n\n---\n\n`)
        .join('');


    // 3. Define the final prompt including the fetched knowledge
    const finalPrompt = `You are an expert academic tutor for college students.
A student will ask you a question. Your task is to provide a clear, concise, and helpful answer based *only* on the provided knowledge base.

If the answer is not found in the documents, state that you do not have information on that topic from the provided materials. Do not use any external knowledge.

When you use information from a document, you MUST cite it by providing its URL and Title in the 'sources' field.

KNOWLEDGE BASE:
${knowledgeBaseText}

User Question: ${input.question}
`;

    // 4. Generate the response
    const { output } = await ai.generate({
      prompt: finalPrompt,
      model: 'googleai/gemini-2.0-flash',
      output: { schema: TutorOutputSchema },
    });
    
    if (!output) {
      return { answer: "I'm sorry, I couldn't generate a response. Please try again." };
    }
    
    return output;
  }
);
