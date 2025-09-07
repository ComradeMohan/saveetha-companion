
'use server';
/**
 * @fileOverview An AI tutor that can answer questions.
 *
 * - askTutor - A function that handles the tutoring process.
 * - TutorInput - The input type for the askTutor function.
 * - TutorOutput - The return type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  })).optional().describe('A list of source documents used to generate the answer. This is now optional.'),
});
export type TutorOutput = z.infer<typeof TutorOutputSchema>;


// Exported wrapper function to be called from the UI
export async function askTutor(input: TutorInput): Promise<TutorOutput> {
  return tutorFlow(input);
}

const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    // 1. Define the final prompt 
    const finalPrompt = `You are an expert academic tutor for college students.
A student will ask you a question. Your task is to provide a clear, concise, and helpful answer.

User Question: ${input.question}
`;

    // 2. Generate the response
    const { output } = await ai.generate({
      prompt: finalPrompt,
      output: { schema: TutorOutputSchema },
    });
    
    // Ensure the output is not null. If it is, return a default answer.
    if (!output) {
      return { answer: "I'm sorry, I couldn't generate a response. Please try again." };
    }
    
    // As we are not using documents, sources will be empty.
    // We can just return the answer portion of the output.
    return { answer: output.answer };
  }
);
