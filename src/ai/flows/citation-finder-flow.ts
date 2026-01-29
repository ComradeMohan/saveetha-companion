
'use server';
/**
 * @fileOverview An AI flow to generate academic citations based on a block of text.
 * - findCitations: Takes a block of text and a style, and returns a list of formatted citations .
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CitationStyleSchema = z.enum(['apa', 'mla', 'chicago']);
export type CitationStyle = z.infer<typeof CitationStyleSchema>;

const CitationFinderInputSchema = z.object({
  text: z.string().describe('The block of text to analyze for finding relevant citations.'),
  style: CitationStyleSchema.describe('The desired citation format (APA, MLA, or Chicago).'),
});
export type CitationFinderInput = z.infer<typeof CitationFinderInputSchema>;

const CitationFinderOutputSchema = z.object({
  citations: z.array(z.string()).describe('A list of 10 formatted academic citations.'),
});
export type CitationFinderOutput = z.infer<typeof CitationFinderOutputSchema>;


export async function findCitations(input: CitationFinderInput): Promise<CitationFinderOutput> {
  return citationFinderFlow(input);
}


const citationFinderFlow = ai.defineFlow(
  {
    name: 'citationFinderFlow',
    inputSchema: CitationFinderInputSchema,
    outputSchema: CitationFinderOutputSchema,
  },
  async (input) => {
    
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `
        You are an expert academic research assistant. Your task is to analyze the following text and generate a list of 10 relevant, realistic-looking academic citations.

        Rules:
        1.  Identify the main topics and keywords from the text provided.
        2.  Based on these topics, create 10 citations for academic papers, articles, or books that would be relevant sources.
        3.  Prioritize works from the last 5-7 years to ensure they are recent.
        4.  Format each of the 10 citations strictly according to the specified citation style: ${input.style.toUpperCase()}.
        5.  The citations should look authentic, with plausible author names, titles, and publication venues (journals, conferences, publishers).
        6.  The final output must be a JSON object containing a single key "citations" which is an array of 10 formatted citation strings.

        Text to analyze:
        ---
        ${input.text}
        ---

        Return only the JSON object adhering to the schema.
      `,
      output: { schema: CitationFinderOutputSchema },
    });
    
    if (!output) {
        throw new Error("The AI failed to generate citations. Please try again.");
    }

    return output;
  }
);
