
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const courseSchema = z.object({
  collegeId: z.string(),
  departmentId: z.string(),
  code: z.string().min(2, { message: 'Course code must be at least 2 characters.' }),
  name: z.string().min(3, { message: 'Course name must be at least 3 characters.' }),
});

export async function addCourse(formData: FormData) {
  const validatedFields = courseSchema.safeParse({
    collegeId: formData.get('collegeId'),
    departmentId: formData.get('departmentId'),
    code: formData.get('code'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed', errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { collegeId, departmentId, code, name } = validatedFields.data;

  try {
    const courseRef = adminDb.collection('colleges').doc(collegeId).collection('departments').doc(departmentId).collection('courses').doc(code.toUpperCase());
    await courseRef.set({ name, createdAt: new Date().toISOString() });
    revalidatePath('/admin/college-learnings');
    return { type: 'success', message: 'Course added successfully.' };
  } catch (error) {
    console.error('Error adding course:', error);
    return { type: 'error', message: 'Failed to add course.' };
  }
}

export async function deleteCourse(collegeId: string, departmentId: string, courseCode: string) {
    try {
        await adminDb.collection('colleges').doc(collegeId).collection('departments').doc(departmentId).collection('courses').doc(courseCode).delete();
        revalidatePath('/admin/college-learnings');
        return { type: 'success', message: 'Course deleted.' };
    } catch (error) {
        console.error('Error deleting course:', error);
        return { type: 'error', message: 'Failed to delete course.' };
    }
}

export async function getCourses(collegeId: string, departmentId: string) {
  if (!collegeId || !departmentId) return [];
  try {
    const snapshot = await adminDb.collection('colleges').doc(collegeId).collection('departments').doc(departmentId).collection('courses').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

const sseCseCourses = [
  { code: 'UBA05', name: 'Engineering Mathematics II' },
  { code: 'EEA01', name: 'Basic Electrical & Electronics Engineering' },
  { code: 'SPIC1', name: 'Project 1' },
  { code: 'UBA10', name: 'Numerical Methods' },
  { code: 'ECA14', name: 'Embedded Systems' },
  { code: 'CSA04', name: 'Operating Systems' },
  { code: 'CSA15', name: 'Cloud Computing and Big Data Analytics' },
  { code: 'CSA51', name: 'Cryptography and Network Security' },
  { code: 'CSA13', name: 'Theory of Computation' },
  { code: 'CSA12', name: 'Computer Architecture' },
  { code: 'CSA17', name: 'Artificial Intelligence' },
  { code: 'DSA01', name: 'Object Oriented Programming with C++' },
  { code: 'UBA09', name: 'Probability and Statistics' },
  { code: 'CSA43', name: 'Internet programming' },
  { code: 'CSA14', name: 'Compiler design' },
  { code: 'CSA09', name: 'Programming in Java' },
  { code: 'CSA06', name: 'Design and Analysis of Algorithms' },
  { code: 'UBA33', name: 'Principles of Management' },
  { code: 'CSA07', name: 'Computer Networks' },
  { code: 'CSA16', name: 'Data warehousing and Data Mining' },
  { code: 'ITA14', name: 'Ethical Hacking' },
  { code: 'CSA08', name: 'Python Programming' },
  { code: 'UBA04', name: 'Discrete Mathematics' },
  { code: 'ECA10', name: 'Microprocessors and Microcontrollers' },
  { code: 'CSA03', name: 'Data Structures' },
  { code: 'CSA57', name: 'Fundamentals of Computing' },
  { code: 'CSA11', name: 'Object Oriented Analysis and Design' },
  { code: 'ECA47', name: 'Principles of Digital System Design' },
  { code: 'CSA02', name: 'C Programming' },
  { code: 'UBA01', name: 'Engineering Mathematics - I' },
  { code: 'UBA49', name: 'Engineering Chemistry' },
  { code: 'UBA48', name: 'Engineering Physics' },
  { code: 'UBA28', name: 'Professional Ethics and Legal Practices' },
  { code: 'CSA05', name: 'Database Management Systems' },
  { code: 'CSA10', name: 'Software Engineering' },
  { code: 'BTA01', name: 'Biology and Environmental Science for Engineers' },
];

const sseAiDsCourses = [
  { code: 'CSA05', name: 'Database Management Systems' },
  { code: 'SPIC1', name: 'Project 1' },
  { code: 'DSA03', name: 'Natural Language Processing' },
  { code: 'EEA01', name: 'Basic Electrical & Electronics Engineering' },
  { code: 'ITA06', name: 'Machine Learning' },
  { code: 'ITA04', name: 'Statistics with R Programming' },
  { code: 'CSA09', name: 'Programming in Java' },
  { code: 'CSA47', name: 'Deep Learning' },
  { code: 'CSA14', name: 'Compiler design' },
  { code: 'CSA04', name: 'Operating Systems' },
  { code: 'CSA15', name: 'Cloud Computing and Big Data Analytics' },
  { code: 'DSA02', name: 'Computer Vision with OpenCV' },
  { code: 'DSA06', name: 'Data Handling and Visualization' },
  { code: 'CSA16', name: 'Data warehousing and Data Mining' },
  { code: 'DSA01', name: 'Object Oriented Programming with C++' },
  { code: 'CSA17', name: 'Artificial Intelligence' },
  { code: 'UBA47', name: 'Statistics & Linear Algebra' },
  { code: 'DSA05', name: 'Query Processing for Data Science' },
  { code: 'CSA03', name: 'Data Structures' },
  { code: 'CSA02', name: 'C Programming' },
  { code: 'CSA07', name: 'Computer Networks' },
  { code: 'UBA04', name: 'Discrete Mathematics' },
  { code: 'CSA10', name: 'Software Engineering' },
  { code: 'UBA01', name: 'Engineering Mathematics - I' },
  { code: 'UBA48', name: 'Engineering Physics' },
  { code: 'ECA47', name: 'Principles of Digital System Design' },
  { code: 'CSA08', name: 'Python Programming' },
  { code: 'UBA33', name: 'Principles of Management' },
  { code: 'UBA49', name: 'Engineering Chemistry' },
  { code: 'UBA28', name: 'Professional Ethics and Legal Practices' },
  { code: 'BTA01', name: 'Biology and Environmental Science for Engineers' },
];

async function seedCourseData(collegeId: string, departmentId: string, courses: {code: string, name: string}[], courseTypeName: string) {
    if (!collegeId || !departmentId) {
        return { type: 'error', message: 'College and Department must be selected.' };
    }

    try {
        const batch = adminDb.batch();
        const coursesCollection = adminDb.collection('colleges').doc(collegeId).collection('departments').doc(departmentId).collection('courses');
        
        courses.forEach(course => {
            const docRef = coursesCollection.doc(course.code);
            batch.set(docRef, { name: course.name, createdAt: new Date().toISOString() });
        });

        await batch.commit();
        revalidatePath('/admin/college-learnings');
        return { type: 'success', message: `${courses.length} ${courseTypeName} courses seeded successfully.` };
    } catch (error) {
        console.error(`Error seeding ${courseTypeName} courses:`, error);
        return { type: 'error', message: `Failed to seed ${courseTypeName} courses.` };
    }
}

export async function seedCourses(collegeId: string, departmentId: string) {
    return seedCourseData(collegeId, departmentId, sseCseCourses, 'CSE');
}

export async function seedAiDsCourses(collegeId: string, departmentId: string) {
    return seedCourseData(collegeId, departmentId, sseAiDsCourses, 'AI & DS');
}
