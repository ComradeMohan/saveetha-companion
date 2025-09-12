'use server';
/**
 * @fileOverview An AI flow to parse raw text into a structured MCQ format.
 * - parseMcqs: Takes a block of text and returns a list of MCQ objects.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const McqOptionSchema = z.object({
  key: z.enum(['a', 'b', 'c', 'd']),
  text: z.string().describe('The text content of the option.'),
});

const McqSchema = z.object({
  questionNumber: z.number().int().describe('The original number of the question in the text.'),
  question: z.string().describe('The text of the question.'),
  options: z.array(McqOptionSchema).length(4).describe('The four options for the question.'),
  correctAnswer: z.enum(['a', 'b', 'c', 'd']).describe('The key of the correct answer (a, b, c, or d).'),
});

const McqParserInputSchema = z.object({
  text: z.string().describe('The raw text containing the list of MCQs to parse.'),
});

const McqParserOutputSchema = z.object({
  mcqs: z.array(McqSchema).describe('The array of parsed MCQ objects.'),
});
export type McqParserOutput = z.infer<typeof McqParserOutputSchema>;

export async function parseMcqs(text: string): Promise<McqParserOutput> {
  return mcqParserFlow({ text });
}

const mcqParserFlow = ai.defineFlow(
  {
    name: 'mcqParserFlow',
    inputSchema: McqParserInputSchema,
    outputSchema: McqParserOutputSchema,
  },
  async ({ text }) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `
        You are an expert data extraction tool. Your task is to parse the following text, which contains multiple-choice questions (MCQs), and convert it into a structured JSON format.

        Follow these rules precisely:
        1. Identify each question, its corresponding options (a, b, c, d), and the correct answer.
        2. The answer is explicitly provided after the options, like "Answer: b)".
        3. Structure each question as a JSON object with the following keys: "questionNumber", "question", "options", and "correctAnswer".
        4. The "options" key must be an array of objects, where each object has a "key" ('a', 'b', 'c', or 'd') and a "text" field.
        5. The "correctAnswer" key must be the single letter character of the correct option (e.g., 'b').
        6. Ensure every single question from the text is parsed. Do not skip any.

        Here is the text to parse:
        ---
        ${text}
        ---

        Return only the JSON object that adheres to the provided output schema.
      `,
      output: { schema: McqParserOutputSchema },
    });

    if (!output) {
      throw new Error('The AI failed to parse the MCQs. Please check the text format and try again.');
    }

    return output;
  }
);
