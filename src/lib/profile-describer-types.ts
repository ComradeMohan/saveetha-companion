
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
