'use server';
/**
 * @fileOverview An intent-based chatbot that answers questions based on a predefined knowledge base.
 *
 * - askTutor - A function that handles the conversation by matching user input to intents.
 * - TutorInput - The input type for the askTutor function.
 * - TutorOutput - The return type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { intents } from '@/lib/knowledge-base';

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

const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    const userQuestion = input.question.toLowerCase().trim();
    
    let matchedIntent = intents.find(intent => intent.tag === 'fallback'); // Default to fallback

    for (const intent of intents) {
        if (intent.tag === 'fallback') continue;
        for (const pattern of intent.patterns) {
            if (userQuestion.includes(pattern.toLowerCase())) {
                matchedIntent = intent;
                break;
            }
        }
        if (matchedIntent?.tag !== 'fallback') {
            break;
        }
    }
    
    const responses = matchedIntent!.responses;
    const answer = responses[Math.floor(Math.random() * responses.length)];

    // Clean up any citation markers that might be in the responses
    const cleanAnswer = answer.replace(/:contentReference\[.*?\]\{.*?\}/g, '').trim();

    return {
        answer: cleanAnswer,
        sources: [], // Sources are not used in this intent-based system
    };
  }
);
