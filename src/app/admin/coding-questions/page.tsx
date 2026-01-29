
'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Loader2, List, FileJson, UploadCloud, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedCodingQuestions, getCodingQuestions } from '@/app/actions/manage-coding-questions';
import type { FetchedProblem } from '@/app/actions/manage-coding-questions';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const dummyLanguages = ['Java', 'Python', 'C++', 'C'];
const dummyDifficulties = ['Easy', 'Medium', 'Hard'];

export default function AdminCodingQuestionsPage() {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<FetchedProblem[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [isSeeding, startSeedingTransition] = useTransition();
    const { toast } = useToast();

    const fetchQuestions = async () => {
        setIsLoadingQuestions(true);
        const fetchedQuestions = await getCodingQuestions();
        setQuestions(fetchedQuestions);
        setIsLoadingQuestions(false);
    }
    
    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast({
            title: "Feature In Development",
            description: "Saving coding questions is not yet implemented.",
        });
        setTimeout(() => setLoading(false), 1000);
    };
    
    const handleSeed = () => {
        startSeedingTransition(async () => {
            const result = await seedCodingQuestions();
            toast({
                title: result.type === 'success' ? 'Success' : 'Error',
                description: result.message,
                variant: result.type === 'error' ? 'destructive' : 'default',
            });
            if (result.type === 'success') {
                fetchQuestions(); // Refresh the list after seeding
            }
        });
    }

    const groupedQuestions = useMemo(() => {
        return questions.reduce((acc, q) => {
            (acc[q.language] = acc[q.language] || []).push(q);
            return acc;
        }, {} as Record<string, FetchedProblem[]>);
    }, [questions]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Coding Question Bank</h2>
                    <p className="text-muted-foreground">Add, edit, and manage coding questions for the student practice area.</p>
                </div>
                 <Button onClick={handleSeed} disabled={isSeeding} variant="outline">
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Seed Dummy Questions
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="lg:col-span-1">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Add New Question</CardTitle>
                            <CardDescription>Fill out the form to add a new question to the bank.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Question Title</Label>
                                <Input id="title" placeholder="e.g., Two Sum" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Given an array of integers..." className="min-h-24" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <Select>
                                        <SelectTrigger id="language"><SelectValue placeholder="Select Language" /></SelectTrigger>
                                        <SelectContent>
                                            {dummyLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Difficulty</Label>
                                     <Select>
                                        <SelectTrigger id="difficulty"><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                                        <SelectContent>
                                            {dummyDifficulties.map(diff => <SelectItem key={diff} value={diff}>{diff}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="testcases">Test Cases (JSON)</Label>
                                <Textarea id="testcases" placeholder='[{"input": "...", "output": "..."}]' className="min-h-32 font-mono text-xs" />
                                 <p className="text-xs text-muted-foreground">Enter as a JSON array of objects.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                Add Question
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Existing Questions</CardTitle>
                        <CardDescription>A list of all questions currently in the bank.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLoadingQuestions ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : questions.length > 0 ? (
                            <ScrollArea className="h-[70vh]">
                                <div className="space-y-4">
                                {Object.entries(groupedQuestions).map(([language, qs]) => (
                                    <div key={language}>
                                        <h3 className="font-semibold text-lg capitalize mb-2">{language}</h3>
                                        <div className="space-y-2 border-l-2 pl-4 ml-2">
                                            {qs.map(q => (
                                                <div key={q.id} className="p-3 bg-secondary/50 rounded-md">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium">{q.title}</p>
                                                        <Badge variant={q.difficulty === 'easy' ? 'default' : q.difficulty === 'medium' ? 'secondary' : 'destructive'} className="capitalize">
                                                            {q.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                                <FileText className="h-10 w-10 mb-4" />
                                <h3 className="text-lg font-semibold">No Questions Found</h3>
                                <p className="text-sm">Use the "Seed" button to populate with dummy data, or add one using the form.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
