
'use server';
/**
 * @fileOverview An AI flow to generate a professional summary for a user profile.
 *
 * - generateProfileDescription - A function that creates a profile summary.
 * - ProfileDescriberInput - The input type for the function.
 * - ProfileDescriberOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ProfileDescriberInputSchema = z.object({
  name: z.string().describe("The user's full name."),
  college: z.string().optional().describe("The user's college (e.g., Saveetha School of Engineering)."),
  department: z.string().optional().describe("The user's department (e.g., Computer Science)."),
  cgpa: z.number().optional().describe("The user's current CGPA."),
});
export type ProfileDescriberInput = z.infer<typeof ProfileDescriberInputSchema>;

export const ProfileDescriberOutputSchema = z.object({
  description: z.string().describe('The generated professional summary for the user.'),
});
export type ProfileDescriberOutput = z.infer<typeof ProfileDescriberOutputSchema>;

export async function generateProfileDescription(input: ProfileDescriberInput): Promise<ProfileDescriberOutput> {
  return profileDescriberFlow(input);
}

const profileDescriberFlow = ai.defineFlow(
  {
    name: 'profileDescriberFlow',
    inputSchema: ProfileDescriberInputSchema,
    outputSchema: ProfileDescriberOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Generate a short, professional, and slightly enthusiastic summary (2-3 sentences) for a student profile.
      
      Here is their information:
      - Name: ${input.name}
      ${input.college ? `- College: ${input.college}` : ''}
      ${input.department ? `- Department: ${input.department}` : ''}
      ${input.cgpa ? `- CGPA: ${input.cgpa.toFixed(2)}` : ''}

      Tailor the description based on the available information. For example, if the CGPA is high, mention their strong academic performance. If the department is specified, highlight their focus in that field.
      
      Example:
      "A dedicated student at Saveetha School of Engineering, currently pursuing a degree in Computer Science. With a strong academic record, they are passionate about technology and eager to apply their skills to real-world challenges."
      `,
      output: { schema: ProfileDescriberOutputSchema },
      model: ai.model('gemini-2.0-flash'),
    });
    
    if (!output) {
        return { description: "A passionate and dedicated student, eager to learn and grow." };
    }

    return output;
  }
);
