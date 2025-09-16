
'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Loader2, Wand2, FileText, Save, AlertTriangle, CheckCircle, ListChecks } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUnifiedCourses, getCourseNameById } from '@/app/actions/manage-course-content';
import { Textarea } from '@/components/ui/textarea';
import { parseMcqs } from '@/ai/flows/mcq-parser-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { saveMcqsForCourse, getCoursesWithMcqs } from '@/app/actions/manage-mcqs';

type Course = { id: string; name: string };

type McqOption = {
  key: 'a' | 'b' | 'c' | 'd';
  text: string;
};

type ParsedMcq = {
  questionNumber: number;
  question: string;
  options: McqOption[];
  correctAnswer: 'a' | 'b' | 'c' | 'd';
};

export default function McqsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesWithMcqs, setCoursesWithMcqs] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedMcqs, setParsedMcqs] = useState<ParsedMcq[]>([]);

  const fetchData = () => {
    startTransition(async () => {
      const [coursesData, mcqCoursesData] = await Promise.all([
        getUnifiedCourses(),
        getCoursesWithMcqs()
      ]);
      setCourses(coursesData);
      setCoursesWithMcqs(mcqCoursesData);
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})`,
      })),
    [courses]
  );
  
  const courseHasMcqs = useMemo(() => coursesWithMcqs.includes(selectedCourse), [coursesWithMcqs, selectedCourse]);


  const handleParseText = async () => {
    if (!pastedText.trim()) {
      toast({ title: 'Error', description: 'Text area is empty.', variant: 'destructive' });
      return;
    }
    setIsParsing(true);
    setParsedMcqs([]);
    toast({ title: 'AI Parsing Started', description: 'The AI is extracting questions from your text...' });

    try {
      const result = await parseMcqs(pastedText);
      if (result.mcqs) {
        setParsedMcqs(result.mcqs.sort((a, b) => a.questionNumber - b.questionNumber));
        toast({ title: 'Parsing Complete', description: `Successfully extracted ${result.mcqs.length} questions.` });
      } else {
        throw new Error("AI did not return any MCQs.");
      }
    } catch (error) {
      console.error('Error parsing MCQs:', error);
      toast({ title: 'Parsing Failed', description: 'Could not extract questions. Please check the text format.', variant: 'destructive' });
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveMcqs = async () => {
    if (!selectedCourse) {
      toast({ title: 'Error', description: 'Please select a course first.', variant: 'destructive' });
      return;
    }
    if (parsedMcqs.length === 0) {
      toast({ title: 'Error', description: 'No questions to save.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveMcqsForCourse(selectedCourse, parsedMcqs);
      if (result.type === 'success') {
        toast({ title: 'Success!', description: result.message });
        setParsedMcqs([]);
        setPastedText('');
        fetchData(); // Refresh the list of courses with MCQs
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving MCQs:', error);
      toast({ title: 'Save Failed', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || id;


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">MCQ Management</h2>
        <p className="text-muted-foreground">Create and manage multiple-choice questions for courses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Step 1: Add or Update Questions</CardTitle>
            <CardDescription>Select a course, then paste your questions. Saving will overwrite any existing questions for that course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Combobox
              options={courseOptions}
              value={selectedCourse}
              onChange={setSelectedCourse}
              placeholder="Select a course..."
              searchPlaceholder="Search courses..."
              notFoundMessage="No course found."
            />
            {courseHasMcqs && (
                <Alert variant="default" className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>This course already has MCQs.</AlertTitle>
                    <AlertDescription>
                        Saving new questions will replace the existing ones.
                    </AlertDescription>
                </Alert>
            )}
            <Textarea
              placeholder="1. What is AI? a) ... b) ... Answer: a)..."
              className="min-h-96 font-mono text-xs"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleParseText} disabled={isParsing || !pastedText.trim()}>
              {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Parse with AI
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-1 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Step 2: Review & Save</CardTitle>
                <CardDescription>Review the questions extracted by the AI.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto space-y-4">
                {parsedMcqs.length > 0 ? (
                parsedMcqs.map((mcq) => (
                    <div key={mcq.questionNumber} className="p-4 border rounded-lg bg-secondary/30">
                    <p className="font-semibold">{mcq.questionNumber}. {mcq.question}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {mcq.options.map(opt => (
                        <li key={opt.key} className="flex items-center gap-2">
                            {opt.key === mcq.correctAnswer ? 
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                            <div className="h-4 w-4 flex-shrink-0" />
                            }
                            <span className="font-mono text-xs">{opt.key})</span>
                            <span>{opt.text}</span>
                        </li>
                        ))}
                    </ul>
                    </div>
                ))
                ) : (
                <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Awaiting Questions</AlertTitle>
                    <AlertDescription>
                    Paste your questions on the left and click "Parse with AI" to see the results here.
                    </AlertDescription>
                </Alert>
                )}
            </CardContent>
            {parsedMcqs.length > 0 && (
                <CardFooter>
                <Button onClick={handleSaveMcqs} disabled={isSaving || !selectedCourse}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save {parsedMcqs.length} Questions to {selectedCourse || '...'}
                </Button>
                </CardFooter>
            )}
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks /> Courses with Quizzes</CardTitle>
                </CardHeader>
                <CardContent className="max-h-48 overflow-y-auto">
                    {isPending ? (
                        <div className="flex justify-center items-center h-24">
                             <Loader2 className="h-6 w-6 animate-spin"/>
                        </div>
                    ) : coursesWithMcqs.length > 0 ? (
                         <ul className="space-y-2 text-sm text-muted-foreground">
                            {coursesWithMcqs.map(id => (
                                <li key={id} className="p-2 bg-secondary/50 rounded-md">
                                    <span className="font-semibold">{getCourseName(id)}</span> ({id})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">No courses have MCQs yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
