
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, FieldValue, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { MonacoCodeEditor } from '@/components/editor/MonacoCodeEditor';
import { LabAIChatAssistant } from '@/components/student/LabAIChatAssistant';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Play, Trash2, PlusCircle, FileCode, Terminal, AlertTriangle, ClipboardType, Share, PanelLeftOpen, X, GripHorizontal, Sparkles, Users, MonitorX } from 'lucide-react';
import type { ProgrammingLanguage, SavedProgram } from '@/types';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';


const MIN_BOTTOM_PANEL_HEIGHT = 100;
const DEFAULT_BOTTOM_PANEL_HEIGHT = 250;

const SANDBOX_LANGUAGES: ProgrammingLanguage[] = [
    { id: 'python', name: 'Python', iconName: 'FileCode' },
    { id: 'java', name: 'Java', iconName: 'FileCode' },
    { id: 'c++', name: 'C++', iconName: 'FileCode' },
    { id: 'c', name: 'C', iconName: 'FileCode' },
];

const getIconComponent = (iconName?: string): React.FC<React.SVGProps<SVGSVGElement>> => {
  if (iconName && LucideIcons[iconName as keyof typeof LucideIcons]) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>;
  }
  return FileCode;
};

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
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>(SANDBOX_LANGUAGES);
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>([]);
  
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [currentProgramTitle, setCurrentProgramTitle] = useState('');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const collaborationListenerRef = useRef<Unsubscribe | null>(null);
  
  const [sampleInput, setSampleInput] = useState('');
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [activeTab, setActiveTab] = useState("input"); 
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);


  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<SavedProgram | null>(null);

  const [bottomPanelHeight, setBottomPanelHeight] = useState(DEFAULT_BOTTOM_PANEL_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const initialHeightRef = useRef(0);
  const sandboxContainerRef = useRef<HTMLDivElement>(null);
  const codeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const loadProgramIntoEditor = useCallback((programData: Partial<SavedProgram>, availableLangs: ProgrammingLanguage[], isLiveUpdate = false) => {
    setCurrentProgramTitle(programData.title || '');
    setSampleInput(programData.lastInput || '');
    
    if (!isLiveUpdate) {
        setIsAIChatOpen(false); 
    }

    let languageToLoad: ProgrammingLanguage | null = null;
    if (programData.languageId) {
        languageToLoad = availableLangs.find(lang => lang.id === programData.languageId) || null;
    }
    
    setSelectedLanguage(languageToLoad);

    const newCode = programData.code === undefined || programData.code === '' 
                    ? getDefaultCodeForLanguage(languageToLoad?.name)
                    : programData.code;

    if (isLiveUpdate || newCode !== currentCode) {
        setCurrentCode(newCode);
    }
    
    if (!isLiveUpdate && !languageToLoad && programData.languageName) {
         toast({
            title: "Language Mismatch",
            description: `The language "${programData.languageName}" this program was saved/shared with is not currently available for solving. Code loaded as plaintext.`,
            variant: "default"
        });
    }

    if (!isLiveUpdate) {
        setOutput('');
        setErrorOutput('');
        setActiveTab("input");
    }
  }, [toast, currentCode]);

  const handleEditorChange = (newCode: string | undefined) => {
    if (newCode === undefined || newCode === currentCode) return;
    setCurrentCode(newCode);

    if (isCollaborating && activeProgramId && user) {
        if (codeUpdateTimeoutRef.current) {
            clearTimeout(codeUpdateTimeoutRef.current);
        }
        codeUpdateTimeoutRef.current = setTimeout(async () => {
            if (activeProgramId && user.uid) {
                 const savedProgramRef = doc(db, 'users', user.uid, 'savedPrograms', activeProgramId);
                 const docSnap = await getDoc(savedProgramRef);
                 if (docSnap.exists() && docSnap.data().userId === user.uid) {
                     updateDoc(savedProgramRef, { code: newCode }).catch(err => console.error("Error syncing code:", err));
                 }
            }
        }, 500);
    }
  };

  const setupCollaborationListener = useCallback((programUserId: string, programId: string, availableLangs: ProgrammingLanguage[]) => {
    if (collaborationListenerRef.current) {
        collaborationListenerRef.current();
    }
    const programDocRef = doc(db, 'users', programUserId, 'savedPrograms', programId);
    collaborationListenerRef.current = onSnapshot(programDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const programData = docSnap.data() as SavedProgram;
            loadProgramIntoEditor(programData, availableLangs, true);
        } else {
             if (collaborationListenerRef.current) {
                collaborationListenerRef.current();
                collaborationListenerRef.current = null;
            }
            setIsCollaborating(false);
            toast({ title: "Collaboration Ended", description: "The shared program may have been deleted.", variant: "destructive" });
        }
    }, (error) => {
        console.error("Collaboration listener error:", error);
        toast({ title: "Collaboration Error", description: "Lost connection to the shared session.", variant: "destructive"});
        setIsCollaborating(false);
    });
    setIsCollaborating(true);
  }, [toast, loadProgramIntoEditor]);

  const handleLoadProgram = useCallback((program: SavedProgram, isShared: boolean = false, isLive: boolean = false) => {
    if (collaborationListenerRef.current) {
        collaborationListenerRef.current();
        collaborationListenerRef.current = null;
    }
    
    setIsCollaborating(false);
    setActiveProgramId(program.id); 

    if (isLive && program.userId) {
        setupCollaborationListener(program.userId, program.id, programmingLanguages);
    } else {
        loadProgramIntoEditor(program, programmingLanguages);
    }
    setIsMobileSidebarOpen(false);
  }, [loadProgramIntoEditor, programmingLanguages, setupCollaborationListener]);


  const handleNewProgram = useCallback(() => {
     if (collaborationListenerRef.current) {
        collaborationListenerRef.current();
        collaborationListenerRef.current = null;
    }
    setIsCollaborating(false);
    setActiveProgramId(null);
    
    const langForNewProgram = selectedLanguage || (programmingLanguages.length > 0 ? programmingLanguages[0] : null);
    
    const newProgramDefaults: Partial<SavedProgram> = { 
      title: 'Untitled-1', 
      code: getDefaultCodeForLanguage(langForNewProgram?.name), 
      lastInput: '',
      languageId: langForNewProgram?.id,
      languageName: langForNewProgram?.name
    };
    
    loadProgramIntoEditor(newProgramDefaults, programmingLanguages);
    setIsMobileSidebarOpen(false);
    toast({ title: "New Program Ready", description: "Editor cleared. You can start coding." });
  }, [programmingLanguages, selectedLanguage, loadProgramIntoEditor, toast]);

  useEffect(() => {
    const loadSandboxData = async () => {
        if (!user?.uid) {
            if (!authLoading) toast({ title: "Error", description: "User information not found.", variant: "destructive" });
            setIsLoadingPageData(false);
            return;
        }

        setIsLoadingPageData(true);
        let fetchedPrograms: SavedProgram[] = [];

        try {
            const programsRef = collection(db, 'users', user.uid, 'savedPrograms');
            const programsSnap = await getDocs(query(programsRef, orderBy('updatedAt', 'desc')));
            fetchedPrograms = programsSnap.docs.map(docSnap => ({ 
                id: docSnap.id, 
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate ? docSnap.data().createdAt.toDate() : new Date(),
                updatedAt: docSnap.data().updatedAt?.toDate ? docSnap.data().updatedAt.toDate() : new Date(),
            } as SavedProgram));
            setSavedPrograms(fetchedPrograms);

        } catch (error) {
            console.error("Error loading sandbox:", error);
            toast({ title: "Error", description: "Could not load sandbox data.", variant: "destructive" });
            setIsLoadingPageData(false);
            return;
        }

        const shareUserId = searchParams.get('userId');
        const shareProgramId = searchParams.get('programId');
        const isCollaboration = searchParams.get('live') === 'true';

        router.replace('/tools/sandbox', { scroll: false });

        if (shareUserId && shareProgramId) {
             const programDocRef = doc(db, 'users', shareUserId, 'savedPrograms', shareProgramId);
             const programSnap = await getDoc(programDocRef);
             if (programSnap.exists()) {
                const sharedProgramData = {id: programSnap.id, ...programSnap.data(), userId: shareUserId} as SavedProgram;
                if (isCollaboration) {
                    setupCollaborationListener(shareUserId, shareProgramId, SANDBOX_LANGUAGES);
                    setActiveProgramId(shareProgramId);
                    toast({ title: "Collaborative Session Started", description: `You are now editing a shared program. Changes will be synced.` });
                } else {
                    handleLoadProgram(sharedProgramData, true, false);
                    toast({ title: "Program Loaded", description: `You are viewing a shared copy of "${sharedProgramData.title}". Save it to create your own editable version.` });
                }
            } else {
                toast({ title: "Error", description: "Shared program not found or access denied.", variant: "destructive" });
                if (fetchedPrograms.length > 0) handleLoadProgram(fetchedPrograms[0]); else handleNewProgram();
            }
        } else if (!activeProgramId) {
            if (fetchedPrograms.length > 0) handleLoadProgram(fetchedPrograms[0]); else handleNewProgram();
        }
        setIsLoadingPageData(false);
    };

    if (!authLoading && user) {
        loadSandboxData();
    } else if (!authLoading && !user) {
        setIsLoadingPageData(false);
    }
  }, [user, authLoading, router, searchParams, toast, handleLoadProgram, handleNewProgram, setupCollaborationListener]);


  const handleSaveProgram = useCallback(async () => {
    if (!user?.uid) {
      toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
      return;
    }
    if (!currentProgramTitle.trim()) {
      toast({ title: "Title Required", description: "Please enter a title for your program.", variant: "destructive" });
      return;
    }
    if (!selectedLanguage) {
      toast({ title: "Language Required", description: "Please select a programming language.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const programDataToSave: Omit<SavedProgram, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & {updatedAt: FieldValue, userId: string, createdAt?: FieldValue} = {
      title: currentProgramTitle.trim(),
      code: currentCode,
      languageName: selectedLanguage.name,
      languageId: selectedLanguage.id,
      iconName: selectedLanguage.iconName || 'FileCode',
      lastInput: sampleInput,
      updatedAt: serverTimestamp(),
      userId: user.uid,
    };

    try {
      if (activeProgramId && !isCollaborating) {
        const programDocRef = doc(db, 'users', user.uid, 'savedPrograms', activeProgramId);
        await updateDoc(programDocRef, programDataToSave as any);
        setSavedPrograms(prev => prev.map(p => p.id === activeProgramId ? { ...p, ...programDataToSave, id: activeProgramId, updatedAt: new Date() } : p).sort((a,b) => (b.updatedAt as Date).valueOf() - (a.updatedAt as Date).valueOf()));
        toast({ title: "Program Updated!", description: `"${programDataToSave.title}" has been updated.` });
      } else {
        programDataToSave.createdAt = serverTimestamp();
        const programsCollectionRef = collection(db, 'users', user.uid, 'savedPrograms');
        const newDocRef = await addDoc(programsCollectionRef, programDataToSave);
        const newProgram = { ...programDataToSave, id: newDocRef.id, createdAt: new Date(), updatedAt: new Date() } as SavedProgram;
        
        setActiveProgramId(newDocRef.id);
        setSavedPrograms(prev => [newProgram, ...prev].sort((a,b) => (b.updatedAt as Date).valueOf() - (a.updatedAt as Date).valueOf()));
        setIsCollaborating(false); 
        if (collaborationListenerRef.current) {
            collaborationListenerRef.current();
            collaborationListenerRef.current = null;
        }
        
        toast({ title: "Program Saved!", description: `A new program "${programDataToSave.title}" has been saved.` });
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast({ title: "Save Error", description: "Failed to save your program.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [user, currentProgramTitle, selectedLanguage, currentCode, sampleInput, activeProgramId, toast, isCollaborating]);

  const handleDeleteProgram = useCallback(async () => {
    if (!programToDelete || !user?.uid) return;
    setIsSaving(true); 
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'savedPrograms', programToDelete.id));
      const newProgramList = savedPrograms.filter(p => p.id !== programToDelete.id);
      setSavedPrograms(newProgramList);

      toast({ title: "Program Deleted", description: `"${programToDelete.title}" has been deleted.` });
      
      if (activeProgramId === programToDelete.id) {
          if (newProgramList.length > 0) {
            handleLoadProgram(newProgramList[0]);
          } else {
            handleNewProgram(); 
          }
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast({ title: "Delete Error", description: "Failed to delete program.", variant: "destructive" });
    } finally {
      setProgramToDelete(null);
      setIsSaving(false);
    }
  },[programToDelete, user, toast, handleNewProgram, activeProgramId, savedPrograms, handleLoadProgram]);

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
      if (activeProgramId && user?.uid && !isCollaborating) {
        try {
            const programDocRef = doc(db, 'users', user.uid, 'savedPrograms', activeProgramId);
            const docSnap = await getDoc(programDocRef);
            if (docSnap.exists()) {
                await updateDoc(programDocRef, { lastInput: sampleInput, updatedAt: serverTimestamp() });
                setSavedPrograms(prev => prev.map(p => p.id === activeProgramId ? { ...p, lastInput: sampleInput, updatedAt: new Date() } : p).sort((a,b) => (b.updatedAt as Date).valueOf() - (a.updatedAt as Date).valueOf()));
            }
        } catch (updateError) {
            console.error("Error updating lastInput:", updateError);
        }
      }

    } catch (error: any) {
      console.error("Error running code:", error);
      setErrorOutput(`Error: ${error.message}`);
      setActiveTab("errors");
      toast({ title: "Execution Error", description: error.message, variant: "destructive" });
    } finally {
      setIsExecuting(false);
    }
  }, [selectedLanguage, currentCode, sampleInput, toast, activeProgramId, user, isCollaborating]);
  
  const handleLanguageChange = useCallback((langId: string) => {
    const newSelectedLang = programmingLanguages.find(l => l.id === langId);
    if (newSelectedLang) {
      setSelectedLanguage(newSelectedLang);

      const activeProgram = savedPrograms.find(p => p.id === activeProgramId);
      
      if (activeProgram && activeProgram.languageId === newSelectedLang.id) {
        setCurrentCode(activeProgram.code || getDefaultCodeForLanguage(newSelectedLang.name));
      } else {
        setCurrentCode(getDefaultCodeForLanguage(newSelectedLang.name));
      }
      
      setOutput(''); 
      setErrorOutput('');
      setActiveTab("input");
    }
  }, [programmingLanguages, savedPrograms, activeProgramId]);

  const handleShareProgram = useCallback((program: SavedProgram, live: boolean) => {
    if (!program.userId || !program.id) {
      toast({title: "Error", description: "Cannot generate link for this program.", variant: "destructive"});
      return;
    }
    const shareUrl = `${window.location.origin}/tools/sandbox?userId=${program.userId}&programId=${program.id}${live ? '&live=true' : ''}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({title: "Link Copied!", description: `Share link for ${live ? 'live collaboration' : 'viewing'} copied to clipboard.`});
      })
      .catch(err => {
        console.error("Failed to copy share link: ", err);
        toast({title: "Error", description: "Could not copy link. Please try again.", variant: "destructive"});
      });
  }, [toast]);

  const toggleAIChat = () => {
    if (isMobile) {
        toast({title: "AI Assistant", description: "AI Assistant is best viewed on larger screens.", variant: "default"});
        return;
    }
    setIsAIChatOpen(prev => !prev);
  };
  const getCurrentCodeForAI = () => currentCode;


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

    const handleMouseUp = () => {
      setIsResizing(false);
    };

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
          <CardTitle className="text-base font-semibold">My Programs</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleNewProgram} 
            disabled={isSaving || isExecuting || programmingLanguages.length === 0} 
            title="New Program"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-1">
          {savedPrograms.length > 0 ? (
            <ul className="space-y-0.5">
              {savedPrograms.map(program => {
                const ProgramIcon = getIconComponent(program.iconName);
                return (
                   <li 
                      key={program.id} 
                      className={cn(
                        "group flex items-center rounded-sm hover:bg-muted/50", 
                        activeProgramId === program.id && (isCollaborating ? "bg-purple-500/10" : "bg-primary/10")
                      )}
                    >
                      <div 
                        className={cn(
                            "flex flex-1 items-center gap-1.5 p-1.5 cursor-pointer text-xs min-w-0", 
                            activeProgramId === program.id && (isCollaborating ? "text-purple-600 font-medium" : "text-primary font-medium")
                        )}
                        onClick={() => !(isSaving || isExecuting) && handleLoadProgram(program, false, isCollaborating)}
                        role="button"
                        tabIndex={isSaving || isExecuting ? -1 : 0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (!(isSaving || isExecuting)) handleLoadProgram(program, false, isCollaborating); } }}
                        title={program.title} 
                      >
                        <ProgramIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate" title={program.title}>{program.title}</span> 
                        {isCollaborating && activeProgramId === program.id && <Users className="h-3 w-3 shrink-0 ml-auto text-purple-600"/>}
                      </div>
                      <div className="flex shrink-0 items-center pr-1"> 
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-60 group-hover:opacity-100 focus:opacity-100 p-1"
                            onClick={(e) => { e.stopPropagation(); handleShareProgram(program, true); }}
                            disabled={isSaving || isExecuting}
                            title="Collaborate (Live Edit)"
                        >
                            <Users className="h-3.5 w-3.5 text-purple-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-60 group-hover:opacity-100 focus:opacity-100 p-1"
                            onClick={(e) => { e.stopPropagation(); handleShareProgram(program, false); }}
                            disabled={isSaving || isExecuting}
                            title="Share (Read-only link)"
                        >
                            <Share className="h-3.5 w-3.5 text-blue-500" />
                        </Button>
                        <AlertDialog onOpenChange={(open) => !open && setProgramToDelete(null)}>
                            <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-60 group-hover:opacity-100 focus:opacity-100 p-1"
                                onClick={(e) => { e.stopPropagation(); setProgramToDelete(program);}}
                                disabled={isSaving || isExecuting}
                                title="Delete Program"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                            </AlertDialogTrigger>
                            {programToDelete && programToDelete.id === program.id && (
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{programToDelete.title}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your saved program.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setProgramToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteProgram} className="bg-destructive hover:bg-destructive/90">
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            )}
                        </AlertDialog>
                      </div>
                    </li>
                );
              })}
            </ul>
          ) : (
             <p className="p-3 text-xs text-muted-foreground text-center">No saved programs yet. Create one and click "Save"!</p>
          )}
        </CardContent>
      </ScrollArea>
       {isMobileContext && 
        <SheetClose asChild>
            <Button variant="outline" className="m-2 text-xs h-8">Close Panel</Button>
        </SheetClose>}
    </>
  );


  if (authLoading || isLoadingPageData) {
    return (
       <main className="flex-1 pt-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">
            Loading Sandbox...
        </span>
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
      <main className="flex-1 flex h-full items-center justify-center text-center p-4">
        <div className="flex flex-col items-center">
          <MonitorX className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Sandbox Not Available</h2>
          <p className="text-muted-foreground mt-2">
            The code sandbox is not available on mobile devices. Please use a desktop or tablet for the best experience.
          </p>
        </div>
      </main>
    )
  }

  const isSandboxDisabled = programmingLanguages.length === 0 && !selectedLanguage;


  return (
    <main className="flex-1 pt-16">
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden" ref={sandboxContainerRef}>
        <div className="flex items-center flex-wrap gap-2 p-2 border-b bg-muted/30 shrink-0">
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 md:hidden">
                <PanelLeftOpen className="h-5 w-5" />
                <span className="sr-only">Toggle File Explorer</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                {sidebarContent(true)}
            </SheetContent>
            </Sheet>
            <Input
            placeholder="Program Title"
            value={currentProgramTitle}
            onChange={(e) => setCurrentProgramTitle(e.target.value)}
            className="h-9 flex-grow min-w-[150px] sm:flex-auto sm:max-w-xs md:max-w-sm bg-background text-xs md:text-sm"
            disabled={isSaving || isExecuting || isSandboxDisabled}
            />
            <Select
            value={selectedLanguage?.id || ''}
            onValueChange={handleLanguageChange}
            disabled={isSaving || isExecuting || programmingLanguages.length === 0 || isCollaborating}
            >
            <SelectTrigger className="w-auto md:w-[160px] h-9 bg-background text-xs md:text-sm">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                {programmingLanguages.length > 0 ? programmingLanguages.map(lang => (
                <SelectItem key={lang.id} value={lang.id} className="text-xs md:text-sm">{lang.name}</SelectItem>
                )) : <SelectItem value="none" disabled>No languages</SelectItem>}
            </SelectContent>
            </Select>
            <Button onClick={handleSaveProgram} size="sm" className="h-9 text-xs md:text-sm" disabled={isSaving || isExecuting || !currentProgramTitle.trim() || !selectedLanguage || isSandboxDisabled}>
            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            <span className="hidden sm:inline">{activeProgramId && !isCollaborating ? 'Update' : 'Save'}</span>
            <span className="sm:hidden">Save</span>
            </Button>
            <Button onClick={handleRunCode} size="sm" className="h-9 text-xs md:text-sm" variant="outline" disabled={isSaving || isExecuting || !currentCode.trim() || !selectedLanguage || isSandboxDisabled}>
            {isExecuting ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            <span className="hidden sm:inline">Run</span>
            <span className="sm:hidden">Run</span>
            </Button>
            {selectedLanguage && (
                <Button variant="outline" size="sm" onClick={toggleAIChat} className="h-9 text-xs md:text-sm">
                <Sparkles className="h-4 w-4 mr-1.5" /> AI Assistant
                </Button>
            )}
        </div>

        <div className="flex flex-1 overflow-hidden relative"> 
            <Card className="w-[240px] md:w-[280px] hidden md:flex flex-col border-r rounded-none shrink-0">
            {sidebarContent()}
            </Card>

            <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-grow relative overflow-hidden">
                <MonacoCodeEditor
                    language={selectedLanguage?.id || 'plaintext'}
                    value={currentCode}
                    onChange={handleEditorChange}
                    height="100%" 
                    options={{ 
                        readOnly: isSaving || isExecuting || !selectedLanguage || (programmingLanguages.length === 0 && !selectedLanguage) || (isCollaborating && user?.uid !== savedPrograms.find(p => p.id === activeProgramId)?.userId),
                    }}
                />
            </div>
            
            <div
                onMouseDown={handleMouseDownOnResizer}
                className="h-2.5 bg-muted hover:bg-accent cursor-row-resize w-full flex items-center justify-center shrink-0"
                title="Drag to resize panel"
            >
                <GripHorizontal className="w-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
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
                        disabled={isExecuting || isSandboxDisabled}
                    />
                    </TabsContent>
                    <TabsContent value="output" className="h-full mt-0 p-0">
                    <ScrollArea className="h-full bg-background">
                        <pre className="p-2 text-xs md:text-sm whitespace-pre-wrap font-mono min-h-full">
                        {isExecuting && !output && !errorOutput && <div className="flex justify-center items-center h-full"><Loader2 className="h-5 w-5 animate-spin" /></div>}
                        {output || (!isExecuting && "Code output will appear here.")}
                        </pre>
                    </ScrollArea>
                    </TabsContent>
                    <TabsContent value="errors" className="h-full mt-0 p-0">
                    <ScrollArea className="h-full bg-background">
                        <pre className="p-2 text-xs md:text-sm text-destructive whitespace-pre-wrap font-mono min-h-full">
                        {isExecuting && !output && !errorOutput && <div className="flex justify-center items-center h-full"><Loader2 className="h-5 w-5 animate-spin" /></div>}
                        {errorOutput || (!isExecuting && "Compilation or runtime errors will appear here.")}
                        </pre>
                    </ScrollArea>
                    </TabsContent>
                </div>
                </Tabs>
            </div>
            </div>
            {selectedLanguage && !isMobile && (
                <LabAIChatAssistant
                    isOpen={isAIChatOpen}
                    onToggle={toggleAIChat}
                    currentLanguageName={selectedLanguage.name}
                    currentQuestionText={"Assistance for your code in the sandbox."}
                    getCurrentCodeSnippet={() => currentCode}
                />
            )}
        </div>
        </div>
    </main>
  );
}
