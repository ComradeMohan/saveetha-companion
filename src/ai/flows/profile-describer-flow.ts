
'use server';
/**
 * @fileOverview An AI flow to generate a professional summary for a user profile.
 *
 * - generateProfileDescription - A function that creates a profile summary.
 */

import { ai } from '@/ai/genkit';
import { 
  ProfileDescriberInputSchema, 
  ProfileDescriberOutputSchema,
  type ProfileDescriberInput,
  type ProfileDescriberOutput
} from '@/lib/profile-describer-types';


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
      model: 'googleai/gemini-2.0-flash',
    });
    
    if (!output) {
        return { description: "A passionate and dedicated student, eager to learn and grow." };
    }

    return output;
  }
);
