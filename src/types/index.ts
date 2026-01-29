
export type TestCase = {
  input: string;
  expectedOutput: string;
};

export type ProgrammingLanguage = {
  id: string;
  name: string;
  iconName?: string;
};

export type SavedProgram = {
  id: string;
  title: string;
  code: string;
  languageName: string;
  languageId: string;
  iconName?: string;
  createdAt: any; 
  updatedAt: any;
  lastInput?: string;
  userId?: string; // For shared programs
};

export const effectTypes = ['snow', 'fireworks', 'confetti', 'rain', 'none'] as const;
export type EffectType = (typeof effectTypes)[number];

export interface SpecialEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  message: string;
  effect: EffectType;
}
