
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getUnits, deleteUnit, addUnit, addTopic } from './manage-course-content';
import { FieldValue } from 'firebase-admin/firestore';


// Schemas for validating the uploaded JSON, matching your provided structure
const TopicJsonSchema = z.object({
  topic_title: z.string(),
  notes_md: z.string().optional(),
  video_url: z.string().url().or(z.literal('')).optional(),
  practice_questions: z.array(z.string()).optional(),
});

const UnitJsonSchema = z.object({
  unit_title: z.string(),
  topics: z.array(TopicJsonSchema),
});

const CourseJsonSchema = z.object({
  course_name: z.string(),
  course_code: z.string(),
  units: z.array(UnitJsonSchema),
});

// Helper function to stringify practice questions
const formatPracticeQuestions = (questions: string[] | undefined) => {
    if (!questions || questions.length === 0) return '';
    return questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
}

export async function importCourseFromJson(prevState: any, formData: FormData) {
  const file = formData.get('jsonFile') as File;
  const courseId = formData.get('courseId') as string;

  if (!file) {
    return { type: 'error', message: 'No JSON file provided.' };
  }
  if (!courseId) {
    return { type: 'error', message: 'No course selected for import.' };
  }

  try {
    const fileContent = await file.text();
    const jsonData = JSON.parse(fileContent);
    
    // Validate the JSON structure
    const validation = CourseJsonSchema.safeParse(jsonData);
    if (!validation.success) {
      console.error('JSON validation error:', validation.error.flatten());
      return { type: 'error', message: `Invalid JSON format. ${validation.error.flatten().formErrors.join(', ')}` };
    }
    
    const parsedData = validation.data;
    
    // Check if the course code in JSON matches the selected course
    if (parsedData.course_code !== courseId) {
        return { type: 'error', message: `JSON file is for course '${parsedData.course_code}', but you selected '${courseId}'.` };
    }

    // Clear existing content for the course
    const existingUnits = await getUnits(courseId);
    for (const unit of existingUnits) {
        await deleteUnit(courseId, unit.id);
    }
    
    const batch = adminDb.batch();
    const courseContentRef = adminDb.collection('course-content').doc(courseId);
    
    // Add new content from JSON
    let unitOrder = 1;
    for (const unit of parsedData.units) {
      const unitRef = courseContentRef.collection('units').doc();
      batch.set(unitRef, { title: unit.unit_title, order: unitOrder++, createdAt: FieldValue.serverTimestamp() });

      for (const topic of unit.topics) {
        const topicRef = unitRef.collection('topics').doc();
        batch.set(topicRef, {
            title: topic.topic_title,
            notes: topic.notes_md || '',
            videoUrl: topic.video_url || '',
            questions: formatPracticeQuestions(topic.practice_questions),
            createdAt: FieldValue.serverTimestamp()
        });
      }
    }
    
    await batch.commit();

    revalidatePath(`/admin/course-content`);
    revalidatePath(`/learn/course/${courseId}`);

    return { type: 'success', message: `Successfully imported content for ${courseId}.` };

  } catch (error: any) {
    console.error('Error importing course from JSON:', error);
    if (error instanceof SyntaxError) {
        return { type: 'error', message: 'Invalid JSON file. Please check the file content.' };
    }
    return { type: 'error', message: 'An unexpected error occurred during import.' };
  }
}
