
'use server';

/**
 * @fileOverview An AI flow to arrange a student's curriculum into a logical roadmap.
 *
 * - arrangeRoadmap - Takes a list of courses and returns a structured, grouped roadmap.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const CourseSchema = z.object({
  id: z.string().describe('The unique course code, e.g., CSA02.'),
  name: z.string().describe('The full name of the course, e.g., C Programming.'),
});
export type Course = z.infer<typeof CourseSchema>;

const StageSchema = z.object({
    name: z.string().describe('A descriptive name for the academic stage, e.g., "Foundational Knowledge".'),
    courses: z.array(CourseSchema).describe('The list of courses in this stage.')
});
export type Stage = z.infer<typeof StageSchema>;

const RoadmapArrangerInputSchema = z.object({
  courses: z.array(CourseSchema).describe("The full list of courses for a student's department."),
});
export type RoadmapArrangerInput = z.infer<typeof RoadmapArrangerInputSchema>;


const RoadmapArrangerOutputSchema = z.object({
  stages: z.array(StageSchema).describe('The structured list of academic stages, each containing a group of courses.')
});
export type RoadmapArrangerOutput = z.infer<typeof RoadmapArrangerOutputSchema>;


export async function arrangeRoadmap(input: RoadmapArrangerInput): Promise<RoadmapArrangerOutput> {
  return roadmapArrangerFlow(input);
}


const roadmapArrangerFlow = ai.defineFlow(
  {
    name: 'roadmapArrangerFlow',
    inputSchema: RoadmapArrangerInputSchema,
    outputSchema: RoadmapArrangerOutputSchema,
  },
  async (input) => {

    const { output } = await ai.generate({
      prompt: `You are an expert academic advisor for a Computer Science & Engineering curriculum.
      Your task is to organize the provided list of courses into a logical, structured learning path.
      
      Follow these rules precisely:
      1. Group the courses into logical stages. Each stage MUST contain exactly 4 courses.
      2. The stages should represent a clear progression from foundational knowledge to more advanced topics.
      3. Give each stage a descriptive name like "Foundational Knowledge", "Core Programming & OS", or "Advanced Computing Theory".
      4. The course with the ID 'SPIC1' (Project 1) MUST be in the very last stage.
      5. Return the full list of courses, ensuring every course is placed into one of the stages.

      Here is the list of courses to arrange:
      ${JSON.stringify(input.courses, null, 2)}
      `,
      output: { schema: RoadmapArrangerOutputSchema },
      model: ai.model('gemini-2.0-flash'),
    });
    
    if (!output) {
        throw new Error("The AI failed to generate a roadmap. Please try again.");
    }

    return output;
  }
);
