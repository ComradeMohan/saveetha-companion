import { config } from 'dotenv';
// Running config here ensures environment variables are loaded for all server-side processes.
config();

import '@/ai/flows/tutor-flow.ts';
import '@/ai/flows/profile-describer-flow.ts';
import '@/ai/flows/roadmap-arranger-flow.ts';
import '@/ai/flows/course-creator-flow.ts';
import '@/ai/flows/mcq-parser-flow.ts';
