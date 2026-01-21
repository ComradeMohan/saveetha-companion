
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
                         answer += `• ${resourceName}: ${url}\n`;
                    });
                } else {
                    answer += "\n\nThis topic is under preparation. We’ll notify once available."
                }
                return { answer, sources: [] };
            }
        }
    }

    // 2. General Intent Matching
    let matchedIntentResponse: string | null = null;
    for (const intent of intents) {
        for (const pattern of intent.patterns) {
            if (userQuestion.includes(pattern.toLowerCase())) {
                if (Array.isArray(intent.responses)) {
                   matchedIntentResponse = intent.responses[Math.floor(Math.random() * intent.responses.length)];
                }
                break;
            }
        }
        if (matchedIntentResponse) break;
    }

    if (matchedIntentResponse) {
        const cleanAnswer = matchedIntentResponse.replace(/:contentReference\[.*?\]\{.*?\}/g, '').trim();
        return { answer: cleanAnswer, sources: [] };
    }
    
    // 3. Fallback
    const fallbackIntent = intents.find(i => i.tag === 'fallback');
    if (fallbackIntent) {
        const response = fallbackIntent.responses[Math.floor(Math.random() * fallbackIntent.responses.length)];
        return { answer: response, sources: [] };
    }

    return { answer: "I'm not sure how to help with that. Could you try rephrasing?", sources: [] };
  }
);
