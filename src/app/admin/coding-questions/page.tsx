'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Loader2, List, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dummy data for now
const dummyLanguages = ['Java', 'Python', 'C++', 'C'];
const dummyDifficulties = ['Easy', 'Medium', 'Hard'];

export default function AdminCodingQuestionsPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast({
            title: "Feature In Development",
            description: "Saving coding questions is not yet implemented.",
        });
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Coding Question Bank</h2>
                <p className="text-muted-foreground">Add, edit, and manage coding questions for the student practice area.</p>
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
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
                            <List className="h-10 w-10 mb-4" />
                            <h3 className="text-lg font-semibold">No Questions Yet</h3>
                            <p className="text-sm">Add a question using the form to see it appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
