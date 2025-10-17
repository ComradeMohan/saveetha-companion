
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
