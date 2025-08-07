import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type FileUpload = {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  user_email: string;
  created_at: string;
  updated_at: string;
};

export interface ProjectFile {
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    category: 'Hardware' | 'Software' | 'Digital Asset';
    thumbnailUrl: string;
    files: ProjectFile[];
    createdAt: string;
}
