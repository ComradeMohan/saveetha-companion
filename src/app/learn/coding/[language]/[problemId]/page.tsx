
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonacoCodeEditor } from '@/components/editor/MonacoCodeEditor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Upload, Terminal, AlertTriangle, ClipboardType, PanelLeft, X, GripHorizontal, FileText, CheckCircle, Lightbulb, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { dummyProblemsByLanguage } from '@/lib/coding-problems';
import type { Problem } from '@/lib/coding-problems';
import { Badge } from '@/components/ui/badge';

const MIN_BOTTOM_PANEL_HEIGHT = 100;
const DEFAULT_BOTTOM_PANEL_HEIGHT = 250;

const languageDisplayNames: { [key: string]: string } = {
  java: 'Java',
  python: 'Python',
  cpp: 'C++',
  c: 'C',
};

type LanguageKey = keyof typeof dummyProblemsByLanguage;

interface TestCaseResult {
  testCaseNumber: number | string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export default function ProblemSolvingPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const isMobile = useIsMobile();
  
  const language = (params.language as LanguageKey) || 'java';
  const problemId = parseInt(params.problemId as string, 10);
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  
  const [sampleInput, setSampleInput] = useState('');
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]);
  const [activeTab, setActiveTab] = useState("testcases");

  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDescriptionPanelOpen, setIsDescriptionPanelOpen] = useState(true);

  const [bottomPanelHeight, setBottomPanelHeight] = useState(DEFAULT_BOTTOM_PANEL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const initialHeightRef = useRef(0);
  const ideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const problemsForLang = dummyProblemsByLanguage[language];
    if (problemsForLang) {
        const foundProblem = [...problemsForLang.easy, ...problemsForLang.medium, ...problemsForLang.hard].find(p => p.id === problemId);
        if (foundProblem) {
            setProblem(foundProblem);
            setCurrentCode(foundProblem.defaultCode);
            setSampleInput(foundProblem.testCases[0]?.input || '');
        } else {
             toast({ title: 'Error', description: 'Problem not found.', variant: 'destructive' });
             router.push(`/learn/coding/${language}`);
        }
    }
  }, [language, problemId, router, toast]);

  const handleEditorChange = (newCode: string | undefined) => {
    setCurrentCode(newCode || '');
  };

  const executeCode = useCallback(async (executionType: 'run' | 'submit') => {
    if (!problem || !currentCode.trim()) {
      toast({ title: "Cannot Run", description: "Problem data or code is missing.", variant: "destructive" });
      return;
    }
    
    if (executionType === 'run') setIsExecuting(true);
    else setIsSubmitting(true);
    
    setOutput('');
    setErrorOutput('');
    setTestCaseResults([]);
    setActiveTab("output");

    const body = {
        language: languageDisplayNames[language],
        code: currentCode,
        executionType,
        testCases: executionType === 'submit' ? problem.testCases : undefined,
        sampleInput: executionType === 'run' ? sampleInput : undefined,
        sampleOutput: executionType === 'run' ? problem.testCases.find(tc => tc.input === sampleInput)?.expectedOutput : undefined
    };

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.executionError || result.compileError || "Code execution request failed");
      }

      if (result.compileError) {
        setErrorOutput(`Compilation Error:\n${result.compileError}`);
        setOutput(result.generalOutput || '');
        setActiveTab("errors");
      } else if (result.executionError) {
        setErrorOutput(`Runtime Error:\n${result.executionError}`);
        setOutput(result.generalOutput || '');
        setActiveTab("errors");
      } else {
          if(executionType === 'run') {
            const runOutput = result.generalOutput || (result.testCaseResults && result.testCaseResults[0]?.actualOutput) || "Execution complete.";
            setOutput(runOutput);
          } else { // submit
            setTestCaseResults(result.testCaseResults);
            setActiveTab("testcases");
          }
      }
    } catch (error: any) {
      setErrorOutput(`Error: ${error.message}`);
      setActiveTab("errors");
      toast({ title: "Execution Error", description: error.message, variant: "destructive" });
    } finally {
       if (executionType === 'run') setIsExecuting(false);
       else setIsSubmitting(false);
    }
  }, [problem, currentCode, sampleInput, language, toast]);


  const handleMouseDownOnResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    initialHeightRef.current = bottomPanelHeight;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !ideContainerRef.current) return;
      const deltaY = e.clientY - startYRef.current;
      let newHeight = initialHeightRef.current - deltaY;
      const containerHeight = ideContainerRef.current.offsetHeight;
      const maxPanelHeight = containerHeight * 0.8;
      newHeight = Math.max(MIN_BOTTOM_PANEL_HEIGHT, Math.min(newHeight, maxPanelHeight));
      setBottomPanelHeight(newHeight);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  if (isMobile) {
      return (
         <main className="flex-1 flex h-full items-center justify-center text-center p-4">
            <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold">Practice Arena Not Available</h2>
            <p className="text-muted-foreground mt-2">
                The coding environment is not optimized for mobile devices. Please use a desktop or tablet for the best experience.
            </p>
            </div>
        </main>
      )
  }

  if (authLoading || !problem) {
    return <div className="flex flex-1 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>;
  }
  
  const allTestsPassed = testCaseResults.length > 0 && testCaseResults.every(r => r.passed);


  return (
    <div className="flex flex-col h-full overflow-hidden" ref={ideContainerRef}>
        <div className="flex items-center flex-wrap gap-2 p-2 border-b bg-muted/30 shrink-0">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsDescriptionPanelOpen(!isDescriptionPanelOpen)}>
                <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-sm">{problem.title}</div>
            <div className="ml-auto flex items-center gap-2">
                <Button onClick={() => executeCode('run')} size="sm" className="h-8" variant="secondary" disabled={isExecuting || isSubmitting}>
                    {isExecuting ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    Run
                </Button>
                <Button onClick={() => executeCode('submit')} size="sm" className="h-8" disabled={isExecuting || isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                    Submit
                </Button>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            <div
                className={cn(
                    "flex-shrink-0 transition-all duration-300 ease-in-out",
                    isDescriptionPanelOpen ? "w-[40%] md:w-[35%]" : "w-0"
                )}
            >
                 <Card className={cn(
                    "h-full flex flex-col border-r rounded-none transition-opacity duration-300",
                     isDescriptionPanelOpen ? "opacity-100" : "opacity-0"
                 )}>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                         <div className="p-4 space-y-4">
                             <h2 className="text-xl font-bold">{problem.title}</h2>
                             <Badge variant={problem.difficulty === 'easy' ? 'default' : problem.difficulty === 'medium' ? 'secondary' : 'destructive'} className="capitalize">{problem.difficulty}</Badge>
                             <p className="text-sm text-muted-foreground">{problem.description}</p>
                             
                             {problem.testCases.slice(0, 2).map((tc, index) => (
                                <div key={index}>
                                    <h4 className="font-semibold text-sm">Example {index + 1}:</h4>
                                    <pre className="mt-1 p-2 bg-secondary/50 rounded-md text-xs font-mono">
                                        <strong>Input:</strong> {tc.input}
                                        <br />
                                        <strong>Output:</strong> {tc.expectedOutput}
                                    </pre>
                                </div>
                             ))}
                         </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-grow relative overflow-hidden">
                    <MonacoCodeEditor language={language} value={currentCode} onChange={handleEditorChange} height="100%" />
                </div>
                
                <div onMouseDown={handleMouseDownOnResizer} className="h-2.5 bg-muted hover:bg-accent cursor-row-resize w-full flex items-center justify-center shrink-0" title="Drag to resize panel">
                    <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="border-t flex flex-col bg-muted/20 shrink-0 overflow-hidden" style={{ height: `${bottomPanelHeight}px` }}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
                        <TabsList className="shrink-0 rounded-none border-b bg-muted/50 justify-start px-2 h-9">
                            <TabsTrigger value="testcases" className="text-xs px-3 py-1.5 h-auto data-[state=active]:bg-background">Test Cases</TabsTrigger>
                            <TabsTrigger value="input" className="text-xs px-3 py-1.5 h-auto data-[state=active]:bg-background">Sample Input</TabsTrigger>
                            <TabsTrigger value="output" className="text-xs px-3 py-1.5 h-auto data-[state=active]:bg-background">Output</TabsTrigger>
                            <TabsTrigger value="errors" className="text-xs px-3 py-1.5 h-auto data-[state=active]:bg-background">Errors</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 overflow-auto p-0 m-0">
                            <TabsContent value="testcases" className="h-full mt-0 p-2 font-mono text-xs">
                                {isSubmitting ? (
                                    <div className="flex h-full items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
                                ) : testCaseResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {allTestsPassed && (
                                            <div className="p-3 rounded-md bg-green-500/10 text-green-700 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4"/>
                                                <span className="font-semibold">All test cases passed!</span>
                                            </div>
                                        )}
                                        {testCaseResults.map(res => (
                                            <div key={res.testCaseNumber} className={cn("p-2 rounded-md border", res.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20')}>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    {res.passed ? <CheckCircle className="h-4 w-4 text-green-500"/> : <XCircle className="h-4 w-4 text-destructive"/>}
                                                    Test Case #{res.testCaseNumber}
                                                </div>
                                                <div className="pl-6 mt-1 space-y-1">
                                                    <p><strong>Input:</strong> {res.input}</p>
                                                    <p><strong>Expected:</strong> {res.expectedOutput}</p>
                                                    <p><strong>Got:</strong> {res.actualOutput}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground"><Lightbulb className="mr-2 h-4 w-4"/>Results from your submission will appear here.</div>
                                )}
                            </TabsContent>
                            <TabsContent value="input" className="h-full mt-0"><Textarea value={sampleInput} onChange={e => setSampleInput(e.target.value)} placeholder="Input for 'Run' action" className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-xs bg-background"/></TabsContent>
                            <TabsContent value="output" className="h-full mt-0"><pre className="p-2 text-xs font-mono h-full w-full bg-background">{isExecuting ? <Loader2 className="h-5 w-5 animate-spin"/> : output || "Output from 'Run' will appear here."}</pre></TabsContent>
                            <TabsContent value="errors" className="h-full mt-0"><pre className="p-2 text-xs font-mono text-destructive h-full w-full bg-background">{isExecuting ? <Loader2 className="h-5 w-5 animate-spin"/> : errorOutput || "Errors will appear here."}</pre></TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    </div>
  );
}
