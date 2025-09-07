
'use server';

/**
 * @fileOverview An AI flow to arrange a student's curriculum into a logical roadmap.
 *
 * - arrangeRoadmap - Takes a list of courses and returns a structured, grouped roadmap.
 */

import { ai } from '@/ai/genkit';
import { 
    RoadmapArrangerInputSchema,
    RoadmapArrangerOutputSchema,
    type RoadmapArrangerInput,
    type RoadmapArrangerOutput
} from '@/lib/roadmap-arranger-types';


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
      model: 'googleai/gemini-2.0-flash',
    });
    
    if (!output) {
        throw new Error("The AI failed to generate a roadmap. Please try again.");
    }

    return output;
  }
);
