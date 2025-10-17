
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { TestCase } from '@/types';

// --- Piston API Integration ---
interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
  compiled?: boolean;
}

interface PistonRequest {
  language: string;
  version: string;
  files: { name: string; content: string }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonExecutionResult {
  stdout: string | null;
  stderr: string | null;
  output: string | null;
  code: number;
  signal: string | null;
}

interface PistonResponse {
  language: string;
  version: string;
  run: PistonExecutionResult;
  compile?: PistonExecutionResult; // Optional, only if language compiles
}

let cachedRuntimes: PistonRuntime[] | null = null;
let lastRuntimeFetchTime: number = 0;
const RUNTIME_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getPistonRuntimes(): Promise<PistonRuntime[]> {
  const now = Date.now();
  if (cachedRuntimes && (now - lastRuntimeFetchTime < RUNTIME_CACHE_DURATION)) {
    return cachedRuntimes;
  }
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/runtimes');
    if (!response.ok) {
      console.error('Piston API: Failed to fetch runtimes - Status:', response.status);
      if (cachedRuntimes) return cachedRuntimes; // Return stale cache on error
      throw new Error(`Failed to fetch Piston runtimes: ${response.status}`);
    }
    const runtimes: PistonRuntime[] = await response.json();
    cachedRuntimes = runtimes;
    lastRuntimeFetchTime = now;
    return runtimes;
  } catch (error) {
    console.error('Piston API: Error fetching runtimes -', error);
    if (cachedRuntimes) return cachedRuntimes; // Return stale cache on critical error
    throw error; // Rethrow if no cache available
  }
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const n1 = parts1[i] || 0;
    const n2 = parts2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

function getLatestVersionAndLanguage(
  requestedLang: string,
  runtimes: PistonRuntime[]
): { version: string; language: string; compiled: boolean } | null {
  const lowerRequestedLang = requestedLang.toLowerCase();
  const matchedRuntimes = runtimes.filter(
    (rt) =>
      rt.language.toLowerCase() === lowerRequestedLang ||
      rt.aliases.some((alias) => alias.toLowerCase() === lowerRequestedLang)
  );

  if (matchedRuntimes.length === 0) {
    return null;
  }
  matchedRuntimes.sort((a, b) => compareVersions(b.version, a.version));
  return {
    version: matchedRuntimes[0].version,
    language: matchedRuntimes[0].language,
    compiled: matchedRuntimes[0].compiled || false,
  };
}

function getPistonFilename(languageName: string): string {
  const lang = languageName.toLowerCase();
  if (lang === 'python') return 'main.py';
  if (lang === 'javascript') return 'main.js';
  if (lang === 'java') return 'Main.java';
  if (lang === 'c++' || lang === 'cpp') return 'main.cpp';
  if (lang === 'c#' || lang === 'csharp') return 'Main.cs'; // Often Main.cs for C#
  if (lang === 'typescript') return 'main.ts';
  if (lang === 'php') return 'main.php';
  if (lang === 'swift') return 'main.swift';
  if (lang === 'kotlin') return 'Main.kt'; // Often Main.kt for Kotlin
  if (lang === 'ruby') return 'main.rb';
  if (lang === 'go') return 'main.go';
  if (lang === 'rust') return 'main.rs';
  // Generic fallback, Piston might infer for some
  return `script.${lang.split(' ')[0]}`; // e.g. script.bash for bash
}


// --- End Piston API Integration ---

interface ExecuteCodeRequestBody {
  language: string;
  code: string;
  testCases?: TestCase[];
  sampleInput?: string;
  sampleOutput?: string; // For mock API and potentially for display
  executionType: 'run' | 'submit';
}

interface TestCaseResult {
  testCaseNumber: number | string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
  time?: string; // Piston doesn't directly provide time per execution in easy format
  memory?: number; // Piston doesn't directly provide memory per execution
}

interface ExecuteCodeResponseBody {
  generalOutput: string;
  testCaseResults: TestCaseResult[];
  executionError?: string;
  compileError?: string;
}

// --- Mock Implementation (Fallback) ---
function simulateActualOutput(code: string, input: string, language: string): string {
  const trimmedCode = code.trim().toLowerCase();
  const originalCodeTrimmed = code.trim();
  // ... (existing simulateActualOutput logic - kept for brevity, assumed it remains)
  if (
    language.toLowerCase() === 'python' &&
    input.trim() === 'A = 12 B = 19' &&
    (originalCodeTrimmed.toLowerCase().includes('is_prime') || originalCodeTrimmed.toLowerCase().includes('isprime')) &&
    originalCodeTrimmed.toLowerCase().includes('range')
  ) {
    return '14, 15, 16, 18';
  }
  if (language.toLowerCase() === 'python') {
    if (trimmedCode === 'print(0)' || originalCodeTrimmed.match(/^user_input\s*=\s*input\(\)\s*\nprint\(0\)$/m)) return '0';
    if (trimmedCode.includes('print(input())') || (trimmedCode.includes('input()') && originalCodeTrimmed.match(/(\w+)\s*=\s*input\(\)\s*print\(\s*\1\s*\)/m))) return input;
    const printMatch = originalCodeTrimmed.match(/print\(\s*(['"`])?(.*?)\1?\s*\)/);
    if (printMatch && !trimmedCode.includes('input()')) {
      const val = printMatch[2];
      if (!isNaN(parseFloat(val)) && isFinite(val as any) || printMatch[1] || /^[a-zA-Z_]\w*$/.test(val) === false) {
         if (printMatch[1]) return val; 
         if (!isNaN(parseFloat(val)) && isFinite(val as any)) return val;
      }
    }
  } else if (language.toLowerCase() === 'java') {
    if (trimmedCode.includes('system.out.println(0);') && !trimmedCode.includes("scanner.")) return '0';
    if (trimmedCode.match(/System\.out\.println\(\s*scanner\.next[a-zA-Z]*\(\s*\)\s*\);/)) return input;
    const printlnMatch = originalCodeTrimmed.match(/System\.out\.println\(\s*(")?(.*?)\1?\s*\);/);
    if (printlnMatch && !trimmedCode.toLowerCase().includes("scanner.")) {
        const val = printlnMatch[2];
        if (printlnMatch[1]) return val;
        if (!isNaN(parseFloat(val)) && isFinite(val as any)) return val;
    }
  } else if (language.toLowerCase() === 'javascript') {
    if (trimmedCode.includes('console.log(0);') && !trimmedCode.match(/(readline|prompt)/)) return '0';
    if (trimmedCode.match(/console\.log\(\s*(readline\(\s*\)|prompt\(\s*\))\s*\);/)) return input;
    const consoleLogMatch = originalCodeTrimmed.match(/console\.log\(\s*(['"`])?(.*?)\1?\s*\);/);
     if (consoleLogMatch && !trimmedCode.match(/(readline|prompt)/)) {
        const val = consoleLogMatch[2];
        if (consoleLogMatch[1]) return val;
        if (!isNaN(parseFloat(val)) && isFinite(val as any)) return val;
    }
  }
  return `Simulated output for input: ${input}`;
}

function simulateErrors(code: string, language: string): { compileError?: string; executionError?: string } {
  const lowerCode = code.toLowerCase();
  const originalCode = code;
  // ... (existing simulateErrors logic - kept for brevity, assumed it remains)
  if (language.toLowerCase() === 'python') {
    if (lowerCode.includes("if x print(y)")) return { compileError: "Simulated SyntaxError: invalid syntax (expected ':' after 'if' condition)" };
    if (originalCode.match(/for\s+\w+\s+in\s+\w+\s+print/)) return { compileError: "Simulated SyntaxError: invalid syntax (expected ':' after 'for' loop)" };
    if (lowerCode.includes("print(undefined_variable_for_error_sim)")) return { executionError: "Simulated NameError: name 'undefined_variable_for_error_sim' is not defined" };
    if (lowerCode.includes("int('abc')")) return { executionError: "Simulated ValueError: invalid literal for int() with base 10: 'abc'" };
  }
  if (language.toLowerCase() === 'javascript') {
    if (originalCode.match(/function\s+\w+\(\s*\)\s*\{[^{}]*$/)) return { compileError: "Simulated SyntaxError: Unexpected end of input (missing '}')" };
    if (lowerCode.includes("null.property_access_for_error_sim")) return { executionError: "Simulated TypeError: Cannot read properties of null (reading 'property_access_for_error_sim')" };
    if (lowerCode.includes("console.log(undeclared_var_for_error_sim);")) return { executionError: "Simulated ReferenceError: undeclared_var_for_error_sim is not defined" };
  }
  if (language.toLowerCase() === 'java') {
      if (originalCode.match(/System\.out\.println\("[^"]*"\Z/m) && !originalCode.match(/System\.out\.println\("[^"]*"\s*;/m) ) return { compileError: "Simulated Compilation Error: ';' expected at end of statement" };
      if (lowerCode.includes("string s = null; s.length()")) return { executionError: "Simulated NullPointerException: Cannot invoke \"String.length()\" because \"s\" is null" };
      if (lowerCode.includes("int[] arr = new int[1]; arr[5] = 10;")) return { executionError: "Simulated ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 1" };
  }
  if (code.toLowerCase().includes("infinite loop simulated error")) return { compileError: `Simulated Compile Error: Detected potential infinite loop construct.` };
  if (code.toLowerCase().includes("runtime simulated error")) return { executionError: `Simulated Runtime Error: Something went wrong during execution.` };
  return {};
}

async function executeWithMockAPI(body: ExecuteCodeRequestBody): Promise<ExecuteCodeResponseBody> {
  const { language, code, testCases, sampleInput, sampleOutput, executionType } = body;
  await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 500));

  let generalOutput = `Simulating execution for ${language} (${executionType} mode)...\n`;
  const currentTestResults: TestCaseResult[] = [];
  const { compileError: simulatedCompileError, executionError: simulatedExecutionError } = simulateErrors(code, language);

  if (simulatedCompileError) {
    generalOutput += `Compilation failed.\n${simulatedCompileError}\n`;
    return { generalOutput, testCaseResults: [], compileError: simulatedCompileError };
  }
  generalOutput += `Code compiled/interpreted successfully (simulation).\n`;

  if (simulatedExecutionError && executionType === 'run') {
      generalOutput += `Execution encountered an error during sample run.\n${simulatedExecutionError}\n`;
      currentTestResults.push({
        testCaseNumber: 'Sample', input: sampleInput || "N/A", expectedOutput: sampleOutput || "N/A",
        actualOutput: `Error: ${simulatedExecutionError}`, passed: false, error: simulatedExecutionError,
      });
      return { generalOutput, testCaseResults: currentTestResults, executionError: simulatedExecutionError };
  }

  if (executionType === 'run') {
    generalOutput += `Running with sample input...\n`;
    const actualSampleOutput = simulateActualOutput(code, sampleInput || "", language);
    currentTestResults.push({
      testCaseNumber: 'Sample', input: sampleInput || "N/A", expectedOutput: sampleOutput || "N/A",
      actualOutput: actualSampleOutput, passed: sampleOutput !== undefined ? actualSampleOutput === sampleOutput : true,
    });
    generalOutput += `Sample input processed (simulation).\nActual output for sample: ${actualSampleOutput}\n`;
  } else if (executionType === 'submit') {
    generalOutput += `Running all test cases...\n\n`;
    if (testCases && testCases.length > 0) {
      let firstExecutionErrorEncountered: string | undefined = undefined;
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (i === 0 && simulatedExecutionError && !firstExecutionErrorEncountered) {
          firstExecutionErrorEncountered = simulatedExecutionError;
          currentTestResults.push({
            testCaseNumber: i + 1, input: tc.input, expectedOutput: tc.expectedOutput,
            actualOutput: `Error: ${simulatedExecutionError}`, passed: false, error: simulatedExecutionError,
          });
          generalOutput += `Test Case ${i+1} failed due to runtime error.\n`;
          break; 
        }
        const simulatedActualOutput = simulateActualOutput(code, tc.input, language);
        currentTestResults.push({
          testCaseNumber: i + 1, input: tc.input, expectedOutput: tc.expectedOutput,
          actualOutput: simulatedActualOutput, passed: simulatedActualOutput === tc.expectedOutput,
        });
      }
      if (firstExecutionErrorEncountered) {
          generalOutput += `Submission failed due to runtime error: ${firstExecutionErrorEncountered}\n`;
      } else {
          generalOutput += `All test cases processed (simulation).\n`;
      }
    } else {
      generalOutput += `No test cases provided for submission.\n`;
    }
  }
  return {
    generalOutput, testCaseResults: currentTestResults,
    compileError: undefined, 
    executionError: simulatedExecutionError && executionType === 'submit' ? simulatedExecutionError : undefined,
  };
}
// --- End Mock Implementation ---

export async function POST(request: NextRequest) {
  try {
    const body: ExecuteCodeRequestBody = await request.json();
    const { language: userLang, code, testCases, sampleInput, sampleOutput, executionType } = body;

    const pistonRuntimes = await getPistonRuntimes();
    const langInfo = getLatestVersionAndLanguage(userLang, pistonRuntimes);

    if (!langInfo) {
      console.warn(`Piston API: Language runtime for "${userLang}" not found. Falling back to mock API.`);
      const mockResponse = await executeWithMockAPI(body);
      mockResponse.generalOutput = `Language "${userLang}" not supported by Piston API. Using simulation.\n${mockResponse.generalOutput}`;
      return NextResponse.json(mockResponse, { status: 200 });
    }

    const pistonPayloadBase: PistonRequest = {
      language: langInfo.language,
      version: langInfo.version,
      files: [{ name: getPistonFilename(langInfo.language), content: code }],
      args: [],
      compile_timeout: 10000, // 10 seconds
      run_timeout: 5000,     // 5 seconds
      // compile_memory_limit: -1, // Default (no limit or Piston's default)
      // run_memory_limit: -1,     // Default
    };

    let responseData: ExecuteCodeResponseBody = {
      generalOutput: "",
      testCaseResults: [],
    };

    if (executionType === 'run') {
      const payload: PistonRequest = { ...pistonPayloadBase, stdin: sampleInput || "" };
      const pistonResponseRaw = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!pistonResponseRaw.ok) {
        const errorText = await pistonResponseRaw.text();
        console.error('Piston API Error (run):', errorText);
        throw new Error(`Piston API request failed: ${pistonResponseRaw.status} - ${errorText}`);
      }
      const result: PistonResponse = await pistonResponseRaw.json();

      let currentCompileError: string | undefined = undefined;
      let currentExecutionError: string | undefined = undefined;
      let actualOutput = result.run.stdout || "";

      if (result.compile && result.compile.code !== 0) {
        currentCompileError = result.compile.stderr || result.compile.stdout || "Compilation failed";
        actualOutput = currentCompileError; // Show compile error as primary output for run
      } else if (result.run.code !== 0) {
        currentExecutionError = result.run.stderr || result.run.stdout || "Runtime error";
        actualOutput = currentExecutionError; // Show runtime error
      }
      
      const passed = sampleOutput !== undefined 
        ? (actualOutput.trim() === sampleOutput.trim() && !currentCompileError && !currentExecutionError) 
        : (!currentCompileError && !currentExecutionError);

      responseData.generalOutput = result.run.output || actualOutput || "";
      if (result.compile?.output && result.compile.output.trim() !== "") {
        responseData.generalOutput = `Compile Output:\n${result.compile.output}\n\nRun Output:\n${responseData.generalOutput}`;
      }


      responseData.testCaseResults.push({
        testCaseNumber: 'Sample',
        input: sampleInput || "N/A",
        expectedOutput: sampleOutput || "N/A", // sampleOutput is from request, not Piston
        actualOutput: actualOutput,
        passed: passed,
        error: currentExecutionError || (currentCompileError ? "Compilation Failed" : undefined),
      });
      responseData.compileError = currentCompileError;
      responseData.executionError = currentExecutionError && !currentCompileError ? currentExecutionError : undefined;

    } else { // executionType === 'submit'
      responseData.generalOutput = `Processing submission with Piston API for ${langInfo.language} v${langInfo.version}...\n`;
      if (!testCases || testCases.length === 0) {
        responseData.generalOutput += "No test cases provided for submission.\n";
      } else {
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const payload: PistonRequest = { ...pistonPayloadBase, stdin: tc.input };
          
          const pistonResponseRaw = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!pistonResponseRaw.ok) {
            const errorText = await pistonResponseRaw.text();
            console.error(`Piston API Error (submit, TC ${i + 1}):`, errorText);
            responseData.testCaseResults.push({
              testCaseNumber: i + 1, input: tc.input, expectedOutput: tc.expectedOutput,
              actualOutput: `Error: ${pistonResponseRaw.status}`, passed: false, error: `Piston API error: ${pistonResponseRaw.status}`,
            });
            if (i === 0) { // Critical error on first test case
              responseData.executionError = `Piston API error on first test case: ${pistonResponseRaw.status}`;
              break;
            }
            continue;
          }
          const result: PistonResponse = await pistonResponseRaw.json();
          
          let tcCompileError: string | undefined = undefined;
          let tcRuntimeError: string | undefined = undefined;
          let tcActualOutput = result.run.stdout || "";

          if (result.compile && result.compile.code !== 0) {
            tcCompileError = result.compile.stderr || result.compile.stdout || "Compilation failed";
            if (!responseData.compileError) responseData.compileError = tcCompileError; // Set global compile error
            tcActualOutput = tcCompileError;
          } else if (result.run.code !== 0) {
            tcRuntimeError = result.run.stderr || result.run.stdout || "Runtime error";
            if (i === 0 && !responseData.executionError && !responseData.compileError) responseData.executionError = tcRuntimeError;
            tcActualOutput = tcRuntimeError;
          }

          const passedThisTc = !tcCompileError && !tcRuntimeError && tcActualOutput.trim() === tc.expectedOutput.trim();

          responseData.testCaseResults.push({
            testCaseNumber: i + 1, input: tc.input, expectedOutput: tc.expectedOutput,
            actualOutput: tcActualOutput.trim(), passed: passedThisTc,
            error: tcRuntimeError || (tcCompileError ? "Compilation Failed" : undefined),
          });

          if (responseData.compileError) {
            responseData.generalOutput += `Compilation failed on test case ${i + 1}: ${responseData.compileError}. Halting submission.\n`;
            break;
          }
          if (i === 0 && responseData.executionError) {
            responseData.generalOutput += `Execution error on first test case: ${responseData.executionError}. Halting submission.\n`;
            break;
          }
        }
        if (!responseData.compileError && !responseData.executionError) {
            responseData.generalOutput += "All test cases processed via Piston API.\n";
        }
      }
    }
    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error('[API /api/execute-code] Error:', error);
    // Fallback to mock for other errors if desired, or return a generic server error
    try {
        const bodyForMock = await request.json().catch(() => null); 
        if (bodyForMock) {
            console.warn("An error occurred with Piston API, falling back to mock API.");
            const mockResponse = await executeWithMockAPI(bodyForMock as ExecuteCodeRequestBody);
            mockResponse.generalOutput = `Error with Piston API (${error.message || 'Unknown error'}). Falling back to simulation.\n${mockResponse.generalOutput}`;
            return NextResponse.json(mockResponse, { status: 200 });
        }
    } catch (fallbackError) {
        console.error('[API /api/execute-code] Fallback mock API error:', fallbackError);
    }

    return NextResponse.json(
      {
        executionError: `Server error processing code execution: ${error.message || 'Unknown error'}`,
        generalOutput: `An unexpected error occurred: ${error.message || 'Unknown error'}`,
        testCaseResults: []
      },
      { status: 500 }
    );
  }
}
