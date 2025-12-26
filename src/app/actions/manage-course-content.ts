
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCourses as getAllCoursesFromDept } from './manage-courses'; // Import the function to get all courses
import { FieldValue, FieldPath } from 'firebase-admin/firestore';

// Define types for stricter control
export type Unit = { id: string; title: string; order: number; };
export type Topic = { id: string; title: string; notes?: string; videoUrl?: string; questions?: string; };

const unitSchema = z.object({
  title: z.string().min(3, { message: 'Unit title must be at least 3 characters.' }),
  order: z.number().int().min(1),
});

const topicSchema = z.object({
    title: z.string().min(3, 'Title is required.'),
    notes: z.string().optional(),
    videoUrl: z.string().url().or(z.literal('')).optional(),
    questions: z.string().optional(),
});


// Helper to get the units collection reference from the new centralized location
const getUnitsCollection = (courseId: string) => {
    return adminDb.collection('course-content').doc(courseId).collection('units');
}

// Helper to get the topics collection reference
const getTopicsCollection = (courseId: string, unitId: string) => {
    return getUnitsCollection(courseId).doc(unitId).collection('topics');
}


// Units Management
export async function addUnit(courseId: string, title: string, order: number) {
  const validatedFields = unitSchema.safeParse({ title, order });
  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed', errors: validatedFields.error.flatten().fieldErrors, id: null };
  }

  try {
    const unitRef = getUnitsCollection(courseId).doc();
    await unitRef.set({ ...validatedFields.data, createdAt: new Date().toISOString() });
    revalidatePath(`/admin/course-content`);
    revalidatePath(`/learn/course/${courseId}`);
    return { type: 'success', message: 'Unit added successfully.', id: unitRef.id };
  } catch (error) {
    console.error('Error adding unit:', error);
    return { type: 'error', message: 'Failed to add unit.', id: null };
  }
}

export async function deleteUnit(courseId: string, unitId: string) {
    try {
        const unitRef = getUnitsCollection(courseId).doc(unitId);
        const topicsSnapshot = await getTopicsCollection(courseId, unitId).get();
        const batch = adminDb.batch();
        topicsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        batch.delete(unitRef);
        await batch.commit();

        revalidatePath(`/admin/course-content`);
        revalidatePath(`/learn/course/${courseId}`);
        return { type: 'success', message: 'Unit and its topics deleted.' };
    } catch (error) {
        console.error('Error deleting unit:', error);
        return { type: 'error', message: 'Failed to delete unit.' };
    }
}

// Get all units for a course
export async function getUnits(courseId: string): Promise<Unit[]> {
  if (!courseId) return [];
  try {
    const unitsSnapshot = await getUnitsCollection(courseId).orderBy('order').get();
    return unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
  } catch (error) {
    console.error(`Error fetching units for ${courseId}:`, error);
    return [];
  }
}

// Topics Management
export async function addTopic(courseId: string, unitId: string, formData: FormData) {
  const validatedFields = topicSchema.safeParse({
    title: formData.get('title'),
    notes: formData.get('notes'),
    videoUrl: formData.get('videoUrl'),
    questions: formData.get('questions'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { title, notes, videoUrl, questions } = validatedFields.data;

  try {
    const topicRef = getTopicsCollection(courseId, unitId).doc();
    await topicRef.set({ title, notes, videoUrl, questions, createdAt: new Date().toISOString() });
    revalidatePath(`/admin/course-content`);
    revalidatePath(`/learn/course/${courseId}`);
    return { type: 'success', message: 'Topic added successfully.' };
  } catch (error) {
    console.error('Error adding topic:', error);
    return { type: 'error', message: 'Failed to add topic.' };
  }
}

export async function updateTopic(courseId: string, unitId: string, topicId: string, formData: FormData) {
    const validatedFields = topicSchema.safeParse({
        title: formData.get('title'),
        notes: formData.get('notes'),
        videoUrl: formData.get('videoUrl'),
        questions: formData.get('questions'),
    });

    if (!validatedFields.success) {
        return { type: 'error', message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
    }

    try {
        const topicRef = getTopicsCollection(courseId, unitId).doc(topicId);
        await topicRef.update({ ...validatedFields.data });
        revalidatePath(`/admin/course-content`);
        revalidatePath(`/learn/course/${courseId}`);
        return { type: 'success', message: 'Topic updated successfully.' };
    } catch (error) {
        console.error('Error updating topic:', error);
        return { type: 'error', message: 'Failed to update topic.' };
    }
}


export async function deleteTopic(courseId: string, unitId: string, topicId: string) {
    try {
        await getTopicsCollection(courseId, unitId).doc(topicId).delete();
        revalidatePath(`/admin/course-content`);
        revalidatePath(`/learn/course/${courseId}`);
        return { type: 'success', message: 'Topic deleted.' };
    } catch (error) {
        console.error('Error deleting topic:', error);
        return { type: 'error', message: 'Failed to delete topic.' };
    }
}

// New efficient function to get all content for a course
export async function getAllCourseContent(courseId: string): Promise<{ units: Unit[], topics: Record<string, Topic[]> }> {
  if (!courseId) {
    return { units: [], topics: {} };
  }
  try {
    const units = await getUnits(courseId);
    
    const allTopics: Record<string, Topic[]> = {};
    if (units.length > 0) {
      // Use collectionGroup query for efficiency
      const topicsSnapshot = await adminDb.collectionGroup('topics')
          .where(FieldPath.documentId(), '>=', `course-content/${courseId}/units/`)
          .where(FieldPath.documentId(), '<', `course-content/${courseId}/units/\uf8ff`)
          .orderBy('createdAt')
          .get();

      topicsSnapshot.docs.forEach(doc => {
        // Path is course-content/{courseId}/units/{unitId}/topics/{topicId}
        const pathParts = doc.ref.path.split('/');
        if (pathParts.length === 5 && pathParts[0] === 'course-content' && pathParts[1] === courseId) {
            const unitId = pathParts[2];
            if (!allTopics[unitId]) {
                allTopics[unitId] = [];
            }
            allTopics[unitId].push({ id: doc.id, ...doc.data() } as Topic);
        }
      });
    }

    return { units, topics: allTopics };
  } catch (error) {
    console.error('Error fetching all course content:', error);
    return { units: [], topics: {} };
  }
}


// Function to get a unified list of all courses from all colleges and departments
export async function getUnifiedCourses() {
    const collegesCollection = await adminDb.collection('colleges').get();
    const allCoursesMap = new Map<string, { id: string; name: string }>();

    for (const collegeDoc of collegesCollection.docs) {
        const departmentsCollection = await collegeDoc.ref.collection('departments').get();
        for (const departmentDoc of departmentsCollection.docs) {
            const courses = await getAllCoursesFromDept(collegeDoc.id, departmentDoc.id);
            courses.forEach(course => {
                if (!allCoursesMap.has(course.id)) {
                    allCoursesMap.set(course.id, { id: course.id, name: course.name as string });
                }
            });
        }
    }
    return Array.from(allCoursesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Function to get a single course's name by its ID, searching across all departments
export async function getCourseNameById(courseId: string): Promise<string | null> {
    if (!courseId) return null;
    const collegesCollection = await adminDb.collection('colleges').get();

    for (const collegeDoc of collegesCollection.docs) {
        const departmentsCollection = await collegeDoc.ref.collection('departments').get();
        for (const departmentDoc of departmentsCollection.docs) {
            const courseDoc = await departmentDoc.ref.collection('courses').doc(courseId).get();
            if (courseDoc.exists) {
                return courseDoc.data()?.name || null;
            }
        }
    }
    return null;
}

// Mind Map Management
export async function saveMindMap(courseId: string, mindMapJson: string) {
    'use server';
    try {
        const mindMapData = JSON.parse(mindMapJson);
        const docRef = adminDb.collection('mind-maps').doc(courseId);
        await docRef.set(mindMapData);
        revalidatePath(`/learn/course/${courseId}`); 
        return { type: 'success', message: 'Mind map saved successfully!' };
    } catch(e: any) {
        if (e instanceof SyntaxError) {
            return { type: 'error', message: 'Invalid JSON format. Please check your syntax.' };
        }
        return { type: 'error', message: e.message || 'An unexpected error occurred.' };
    }
}

export async function getMindMapForCourse(courseId: string) {
    'use server';
    if (!courseId) return null;
    try {
        const docRef = adminDb.collection('mind-maps').doc(courseId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error(`Error fetching mind map for ${courseId}:`, error);
        return null;
    }
}
