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
import { intents, courses } from '@/lib/knowledge-base';

// Define Zod schemas for input and output
const TutorInputSchema = z.object({
  question: z.string().describe('The question from the user.'),
  history: z.array(z.object({
      role: z.enum(['user', 'bot']),
      content: z.string()
  })).optional().describe('The conversation history.')
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

// Helper function to escape special characters in a string for use in a RegExp.
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


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
    const history = input.history || [];
    
    // 1. Specific Course Lookup
    for (const course of courses) {
        const courseKeywords = [
            course.course_code.toLowerCase(),
            course.course_name.toLowerCase(),
            ...(course.keywords || [])
        ];
        
        for (const keyword of courseKeywords) {
            // Escape special regex characters (like '+') to prevent errors.
            const escapedKeyword = escapeRegExp(keyword);
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

            if (regex.test(userQuestion)) {
                let answer = `Found it! Here's what I know about **${course.course_name} (${course.course_code})**:\n\n${course.description}`;
                const resources = Object.entries(course.resources).filter(([, url]) => url);

                if (resources.length > 0) {
                    answer += "\n\n**Available Resources:**\n";
                    resources.forEach(([name, url]) => {
                         const resourceName = name.replace(/_url/g, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                         answer += `• [${resourceName}](${url})\n`;
                    });
                } else {
                    answer += "\n\nThis topic is under preparation. We’ll notify once available."
                }
                return { answer, sources: [] };
            }
        }
    }

    // 2. Fallback to Generative AI
    const historyForAI = history.map(h => ({
        role: h.role === 'bot' ? 'model' : 'user',
        parts: [{text: h.content}]
    }));
    
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `You are Comrade, a friendly and helpful academic assistant for Saveetha Engineering College students. Your primary role is to answer questions about courses and academic life.
      
      - If the user asks about a specific course, provide information about it.
      - If the user asks a general knowledge question (e.g., "what is java?"), provide a helpful and accurate response.
      - Keep responses concise and easy to understand.
      - If you don't know the answer, say "I'm not sure how to help with that. Could you try rephrasing?".

      User's question: "${input.question}"
      `,
      history: historyForAI,
      output: { schema: TutorOutputSchema },
    });
    
    if (!output) {
      return { answer: "I'm not sure how to help with that. Could you try rephrasing?", sources: [] };
    }

    return output;
  }
);
