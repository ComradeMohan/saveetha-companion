
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

export const RoadmapArrangerInputSchema = z.object({
  courses: z.array(CourseSchema).describe("The full list of courses for a student's department."),
});
export type RoadmapArrangerInput = z.infer<typeof RoadmapArrangerInputSchema>;


export const RoadmapArrangerOutputSchema = z.object({
  stages: z.array(StageSchema).describe('The structured list of academic stages, each containing a group of courses.')
});
export type RoadmapArrangerOutput = z.infer<typeof RoadmapArrangerOutputSchema>;
