
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { MonacoCodeEditor } from '@/components/editor/MonacoCodeEditor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, PlusCircle, FileCode, Terminal, AlertTriangle, ClipboardType, PanelLeftOpen, GripHorizontal, MonitorX } from 'lucide-react';
import type { ProgrammingLanguage, SavedProgram } from '@/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams } from 'next/navigation';


const MIN_BOTTOM_PANEL_HEIGHT = 100;
const DEFAULT_BOTTOM_PANEL_HEIGHT = 250;

const SANDBOX_LANGUAGES: ProgrammingLanguage[] = [
    { id: 'python', name: 'Python', iconName: 'FileCode' },
    { id: 'java', name: 'Java', iconName: 'FileCode' },
    { id: 'c++', name: 'C++', iconName: 'FileCode' },
    { id: 'c', name: 'C', iconName: 'FileCode' },
];

const getDefaultCodeForLanguage = (langName?: string): string => {
  if (!langName) return "// Select a language to start coding!";
  const lowerLang = langName.toLowerCase();
  if (lowerLang === 'python') {
    return `# Welcome to the Sandbox! Start coding in Python.
# Use the "Sample Input" tab below to provide input for your program.

def main():
    print("Hello from Python Sandbox!")

if __name__ == "__main__":
    main()
`;
  } else if (lowerLang === 'c' || lowerLang === 'c++') {
     return `// Welcome to the Sandbox! Start coding in C/C++.
#include <iostream>

int main() {
    std::cout << "Hello from C++/C Sandbox!" << std::endl;
    return 0;
}
`;
  } else if (lowerLang === 'java') {
    return `// Welcome to the Sandbox! Start coding in Java.
// The online compiler executes the main method of a public class named "Main".
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java Sandbox!");
    }
}
`;
  }
  return `// Welcome to the Sandbox! Start coding in ${langName}.\n`;
};


export default function StudentSandboxPage() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [currentProgramTitle, setCurrentProgramTitle] = useState('Untitled-1');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
  
  const [sampleInput, setSampleInput] = useState('');
  const [output, setOutput] = useState('Code output will appear here.');
  const [errorOutput, setErrorOutput] = useState('Errors will appear here.');
  const [activeTab, setActiveTab] = useState("output"); 
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isExecuting, setIsExecuting] = useState(false);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(DEFAULT_BOTTOM_PANEL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const initialHeightRef = useRef(0);
  const sandboxContainerRef = useRef<HTMLDivElement>(null);
  const languageFromUrl = searchParams.get('language');

  const handleNewProgram = useCallback(() => {
    let lang;
    if (languageFromUrl) {
      lang = SANDBOX_LANGUAGES.find(l => l.id === languageFromUrl) || SANDBOX_LANGUAGES[0];
    } else {
      lang = selectedLanguage || SANDBOX_LANGUAGES[0];
    }
    
    setCurrentProgramTitle('Untitled-1');
    setSelectedLanguage(lang);
    setCurrentCode(getDefaultCodeForLanguage(lang.name));
    setSampleInput('');
    setOutput('Code output will appear here.');
    setErrorOutput('Errors will appear here.');
    setActiveTab('output');
    setIsMobileSidebarOpen(false);
  }, [selectedLanguage, languageFromUrl]);

  useEffect(() => {
    handleNewProgram();
  }, [handleNewProgram]);

  const handleLanguageChange = (langName: string) => {
    if (languageFromUrl) return; // Do not allow change if language is from URL
    const newSelectedLang = SANDBOX_LANGUAGES.find(l => l.name === langName);
    if (newSelectedLang) {
      setSelectedLanguage(newSelectedLang);
      setCurrentCode(getDefaultCodeForLanguage(newSelectedLang.name));
      setOutput('Code output will appear here.');
      setErrorOutput('Errors will appear here.');
      setActiveTab("output");
    }
  };
  
  const handleRunCode = useCallback(async () => {
    if (!selectedLanguage || !currentCode.trim()) {
      toast({ title: "Cannot Run", description: "Please select a language and write some code.", variant: "destructive" });
      return;
    }
    setIsExecuting(true);
    setOutput('');
    setErrorOutput('');
    setActiveTab("output");

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage.name,
          code: currentCode,
          sampleInput: sampleInput,
          executionType: 'run', 
        }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.executionError || result.compileError || result.message || "Code execution request failed");
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
        const displayedOutput = result.generalOutput || (result.testCaseResults && result.testCaseResults[0]?.actualOutput) || "Execution complete. No output or specific result format received.";
        setOutput(displayedOutput);
        setErrorOutput('');
      }
    } catch (error: any) {
      console.error("Error running code:", error);
      setErrorOutput(`Error: ${error.message}`);
      setActiveTab("errors");
      toast({ title: "Execution Error", description: error.message, variant: "destructive" });
    } finally {
      setIsExecuting(false);
    }
  }, [selectedLanguage, currentCode, sampleInput, toast]);

  const handleMouseDownOnResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    initialHeightRef.current = bottomPanelHeight;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sandboxContainerRef.current) return;
      const deltaY = e.clientY - startYRef.current;
      let newHeight = initialHeightRef.current - deltaY; 

      const containerHeight = sandboxContainerRef.current.offsetHeight;
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

  const sidebarContent = (isMobileContext = false) => (
    <>
      <CardHeader className="p-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">File Explorer</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleNewProgram} 
            title="New Program"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-1">
            <div 
              className="flex flex-1 items-center gap-1.5 p-1.5 cursor-pointer text-xs min-w-0 rounded-sm bg-primary/10 text-primary font-medium"
              role="button"
            >
              <FileCode className="h-4 w-4 shrink-0" />
              <span className="truncate" title={currentProgramTitle}>{currentProgramTitle}</span> 
            </div>
        </CardContent>
      </ScrollArea>
       {isMobileContext && 
        <SheetClose asChild>
            <Button variant="outline" className="m-2 text-xs h-8">Close Panel</Button>
        </SheetClose>}
    </>
  );


  if (authLoading) {
    return (
      <main className="flex-1 pt-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }
  
  if (!user) {
     return (
      <main className="flex-1 pt-16 flex items-center justify-center">
          <p className="text-muted-foreground">Please log in to use the sandbox.</p>
      </main>
    );
  }

  if (isMobile) {
    return (
      <main className="flex-1 pt-16 flex flex-col h-full items-center justify-center text-center p-4">
        <MonitorX className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Sandbox Not Available</h2>
        <p className="text-muted-foreground mt-2">
          The code sandbox is not available on mobile devices. Please use a desktop or tablet for the best experience.
        </p>
      </main>
    )
  }

  return (
    <main className="flex-1 pt-16">
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden" ref={sandboxContainerRef}>
            <div className="flex items-center flex-wrap gap-2 p-2 border-b bg-muted/30 shrink-0">
                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-9 w-9 md:hidden">
                    <PanelLeftOpen className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                    {sidebarContent(true)}
                </SheetContent>
                </Sheet>
                <Select
                  value={selectedLanguage?.name || ''}
                  onValueChange={handleLanguageChange}
                  disabled={!!languageFromUrl}
                >
                <SelectTrigger className="w-auto md:w-[160px] h-9 bg-background text-xs md:text-sm">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    {SANDBOX_LANGUAGES.map(lang => (
                    <SelectItem key={lang.id} value={lang.name} className="text-xs md:text-sm">{lang.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <Button onClick={handleRunCode} size="sm" className="h-9 text-xs md:text-sm" variant="outline" disabled={isExecuting || !currentCode.trim() || !selectedLanguage}>
                {isExecuting ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                <span className="hidden sm:inline">Run</span>
                <span className="sm:hidden">Run</span>
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden relative"> 
                <Card className="w-[240px] md:w-[280px] hidden md:flex flex-col border-r rounded-none shrink-0">
                {sidebarContent()}
                </Card>

                <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-grow relative overflow-hidden">
                    <MonacoCodeEditor
                    language={selectedLanguage?.name.toLowerCase() || 'plaintext'}
                    value={currentCode}
                    onChange={(value) => setCurrentCode(value || '')}
                    height="100%"
                    />
                </div>
                
                <div
                    onMouseDown={handleMouseDownOnResizer}
                    className="h-2.5 bg-muted hover:bg-accent cursor-row-resize w-full flex items-center justify-center shrink-0"
                    title="Drag to resize panel"
                >
                    <GripHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground" />
                </div>

                <div
                    className="border-t flex flex-col bg-muted/20 shrink-0 overflow-hidden"
                    style={{ height: `${bottomPanelHeight}px` }}
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
                    <TabsList className="shrink-0 rounded-none border-b bg-muted/50 justify-start px-1 md:px-2 h-9 md:h-10">
                        <TabsTrigger value="input" className="text-xs px-2 py-1 md:px-3 md:py-1.5 h-auto data-[state=active]:bg-background">
                            <ClipboardType className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5"/> Sample Input
                        </TabsTrigger>
                        <TabsTrigger value="output" className="text-xs px-2 py-1 md:px-3 md:py-1.5 h-auto data-[state=active]:bg-background">
                            <Terminal className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5"/> Output
                        </TabsTrigger>
                        <TabsTrigger value="errors" className="text-xs px-2 py-1 md:px-3 md:py-1.5 h-auto data-[state=active]:bg-background">
                            <AlertTriangle className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5"/> Errors
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-hidden p-0 m-0">
                        <TabsContent value="input" className="h-full mt-0 p-0">
                        <Textarea
                            placeholder="Enter sample input for your code here..."
                            value={sampleInput}
                            onChange={(e) => setSampleInput(e.target.value)}
                            className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-xs md:text-sm p-2 bg-background"
                        />
                        </TabsContent>
                        <TabsContent value="output" className="h-full mt-0 p-0">
                        <ScrollArea className="h-full bg-background">
                            <pre className="p-2 text-xs md:text-sm whitespace-pre-wrap font-mono min-h-full">
                            {isExecuting ? <Loader2 className="h-5 w-5 animate-spin" /> : (output || "Code output will appear here.")}
                            </pre>
                        </ScrollArea>
                        </TabsContent>
                        <TabsContent value="errors" className="h-full mt-0 p-0">
                        <ScrollArea className="h-full bg-background">
                            <pre className="p-2 text-xs md:text-sm text-destructive whitespace-pre-wrap font-mono min-h-full">
                             {isExecuting ? <Loader2 className="h-5 w-5 animate-spin" /> : (errorOutput || "Errors will appear here.")}
                            </pre>
                        </ScrollArea>
                        </TabsContent>
                    </div>
                    </Tabs>
                </div>
                </div>
            </div>
        </div>
    </main>
  
    