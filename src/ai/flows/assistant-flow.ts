
'use server';
/**
 * @fileOverview A general-purpose AI assistant for students.
 * - askAssistant - The primary function to interact with the chatbot.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssistantInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).describe('The conversation history.'),
});

const AssistantOutputSchema = z.object({
  content: z.string().describe('The AI-generated response.'),
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;


export async function askAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const prompt = `You are a friendly and helpful AI assistant for students of Saveetha Engineering College. Your name is "Saveetha Assistant".

Your primary purpose is to help students navigate the features of this website and answer general questions they might have about the college or student life.

You have knowledge of the following features on this website:
- CGPA Calculator
- Attendance Calculator
- Faculty Directory
- Concept Map Library
- Events Calendar
- University Updates
- Free Certifications Hub
- Ecommerce Marketplace for student projects

When a user asks a question, first determine if it relates to one of these features. If it does, guide them on how to use it or where to find it.

Keep your answers concise, friendly, and to the point. Use markdown for formatting if it helps clarity (e.g., lists, bold text).

Do not answer questions that are inappropriate, personal, or unrelated to student life or this website. Instead, politely decline.

Here is the current conversation history. The last message is the user's new question. Respond to that.`;


const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const { history } = input;
    
    // Convert history to the format expected by the generate API
    const messages = history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      content: [{ text: msg.content }],
    }));

    const { output } = await ai.generate({
      prompt: prompt,
      history: messages,
      output: { schema: AssistantOutputSchema },
    });
    
    return output!;
  }
);
