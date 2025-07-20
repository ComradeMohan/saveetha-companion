import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kqgamenaolrsdsakcadf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZ2FtZW5hb2xyc2RzYWtjYWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNTU4MjYsImV4cCI6MjA2NjkzMTgyNn0.ontJZZYWK3N7NbXD1IGtLAYOpZPTh5IgdyqobWQzeHo";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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