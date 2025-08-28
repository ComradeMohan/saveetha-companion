import { config } from 'dotenv';
// Running config here ensures environment variables are loaded for all server-side processes.
config();

import '@/ai/flows/tutor-flow.ts';
import '@/ai/flows/knowledge-feeder.ts';
