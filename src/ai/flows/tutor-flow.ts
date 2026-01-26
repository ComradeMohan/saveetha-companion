
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
    
    // Check for "list all cse courses" command
    if (userQuestion.includes("list all cse courses")) {
        const cseCourses = courses
            .filter(c => c.category === 'Computer Science')
            .map(c => `• ${c.course_code} - ${c.course_name}`)
            .join('\n');
        
        if (cseCourses) {
            const answer = `Here are the Computer Science (CSE) courses I know about:\n\n${cseCourses}`;
            return { answer, sources: [] };
        } else {
             return { answer: "I couldn't find any CSE courses in my knowledge base.", sources: [] };
        }
    }

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

    // 2. Intent-based fallback
    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        const regex = new RegExp(`\\b${pattern}\\b`, 'i');
        if (regex.test(userQuestion)) {
          const response = intent.responses[Math.floor(Math.random() * intent.responses.length)];
          return { answer: response, sources: [] };
        }
      }
    }

    // 3. Final Fallback if no intent matches
    const fallbackIntent = intents.find(i => i.tag === 'fallback');
    const fallbackResponse = fallbackIntent ? fallbackIntent.responses[0] : "I can provide resources for specific courses. Please ask me about a course using its name or code (e.g., 'tell me about CSA09' or 'show me resources for Programming in Java'). How can I help you today?";
    
    return { answer: fallbackResponse, sources: [] };
  }
);
