import { config } from 'dotenv';
// Running config here ensures environment variables are loaded for all server-side processes.
config();

import '@/ai/flows/tutor-flow.ts';
// Knowledge feeder is no longer used by the tutor flow.
// import '@/ai/flows/knowledge-feeder.ts';
