'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Reads the `public/courses` directory and returns a list of filenames.
 * This is a server action and can only run on the server.
 */
export async function getCourseFiles(): Promise<string[]> {
  try {
    // process.cwd() gives the root of the project
    const coursesDirectory = path.join(process.cwd(), 'public', 'courses');
    const filenames = await fs.readdir(coursesDirectory);
    // Filter to include only .json files
    return filenames.filter(file => file.endsWith('.json'));
  } catch (error: any) {
    // If the directory doesn't exist, ENOENT error is thrown.
    // In this case, it's not a critical error, just means no files are there.
    if (error.code === 'ENOENT') {
      console.log('`public/courses` directory not found. Returning empty list.');
      return [];
    }
    console.error('Error reading course files directory:', error);
    // For other errors, re-throw to indicate a server problem.
    throw new Error('Failed to retrieve course files.');
  }
}
