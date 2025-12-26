
'use server';

/**
 * @fileOverview An AI flow to arrange a student's curriculum into a logical roadmap.
 *
 * THIS FLOW IS DEPRECATED AND NOT CURRENTLY IN USE.
 * The application has been updated to use a simpler, non-AI based roadmap generation
 * to avoid API rate-limiting issues.
 */

import { ai } from '@/ai/genkit';
import { 
    RoadmapArrangerInputSchema,
    RoadmapArrangerOutputSchema,
    type RoadmapArrangerInput,
    type RoadmapArrangerOutput
} from '@/lib/roadmap-arranger-types';


export async function arrangeRoadmap(input: RoadmapArrangerInput): Promise<RoadmapArrangerOutput> {
  // This is a dummy implementation to avoid breaking the build.
  // The actual logic has been moved to a simple function in the frontend.
  const stages = [];
  const chunkSize = 4;
   for (let i = 0; i < input.courses.length; i += chunkSize) {
        const chunk = input.courses.slice(i, i + chunkSize);
        stages.push({
            name: `Stage ${stages.length + 1}`,
            courses: chunk,
        });
    }
  return Promise.resolve({ stages });
}


const roadmapArrangerFlow = ai.defineFlow(
  {
    name: 'roadmapArrangerFlow_DEPRECATED',
    inputSchema: RoadmapArrangerInputSchema,
    outputSchema: RoadmapArrangerOutputSchema,
  },
  async (input) => {

    const { output } = await ai.generate({
      prompt: `You are an expert academic advisor. Organize the provided list of courses into a logical, structured learning path.
      
      Follow these rules precisely:
      1. Group the courses into logical stages, each containing exactly 4 courses.
      2. The stages should represent a clear progression from foundational to advanced topics.
      3. Give each stage a descriptive name like "Foundational Knowledge" or "Core Programming".
      4. Place the course with ID 'SPIC1' in the very last stage.
      5. Ensure every course is placed into one of the stages.

      Courses:
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
