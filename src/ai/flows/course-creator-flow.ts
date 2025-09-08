'use server';
/**
 * @fileOverview An AI flow to generate a complete course structure.
 * - generateCourseContent: Creates a structured course with units and topics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const CourseCreatorInputSchema = z.object({
  courseName: z.string().describe('The name of the course to generate content for, e.g., "Data Structures".'),
});
export type CourseCreatorInput = z.infer<typeof CourseCreatorInputSchema>;

// Output Schema
const TopicSchema = z.object({
    title: z.string().describe("The title of the topic, e.g., 'Introduction to Linked Lists'."),
    notes: z.string().optional().describe("A brief, clear explanation of the topic. Can use Markdown for formatting."),
    videoUrl: z.string().url().optional().describe("A relevant YouTube video URL for the topic."),
    questions: z.string().optional().describe("1-2 key practice questions related to the topic."),
});

const UnitSchema = z.object({
    title: z.string().describe("The title of the unit, e.g., 'Unit 1: Fundamental Data Structures'."),
    order: z.number().int().positive().describe("The sequential order of the unit in the course."),
    topics: z.array(TopicSchema).describe("A list of topics covered in this unit."),
});

const CourseCreatorOutputSchema = z.object({
  units: z.array(UnitSchema).describe('The complete list of generated units for the course.'),
});
export type CourseCreatorOutput = z.infer<typeof CourseCreatorOutputSchema>;


// Exported wrapper function
export async function generateCourseContent(input: CourseCreatorInput): Promise<CourseCreatorOutput> {
  return courseCreatorFlow(input);
}


// The Genkit Flow
const courseCreatorFlow = ai.defineFlow(
  {
    name: 'courseCreatorFlow',
    inputSchema: CourseCreatorInputSchema,
    outputSchema: CourseCreatorOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: `
        You are an expert curriculum designer for a university's computer science department.
        Your task is to generate a complete, structured learning module for a given course.

        Course Name: "${input.courseName}"

        Follow these instructions precisely:
        1.  Create exactly 5 distinct units for the course. Each unit should represent a major section of the subject.
        2.  Assign each unit a title and a sequential order number (1 through 5).
        3.  For each unit, generate exactly 3-4 relevant topics.
        4.  For each topic, you MUST provide:
            a. A clear and concise 'notes' section explaining the core concept (2-4 sentences). Use Markdown for lists or emphasis.
            b. A 'videoUrl' field pointing to a *real, relevant, and high-quality* YouTube video for that specific topic.
            c. A 'questions' field containing 1-2 important practice questions.

        Ensure the entire output adheres to the JSON schema provided.
      `,
      output: { schema: CourseCreatorOutputSchema },
    });
    
    if (!output) {
        throw new Error("The AI failed to generate course content. Please try again.");
    }

    return output;
  }
);
