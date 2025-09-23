
'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, LogIn, Code, Database, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { problems } from '@/lib/placement-prep-data';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'sql' | 'coding';

export default function PlacementPrepPage() {
    const { user, loading } = useAuth();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredProblems = useMemo(() => {
        if (filter === 'all') {
            return problems;
        }
        return problems.filter(p => p.category === filter);
    }, [filter]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </main>
                <Footer />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                     <Card className="max-w-md mx-auto text-center">
                        <CardHeader>
                            <CardTitle>Access Denied</CardTitle>
                            <CardDescription>You must be logged in to access placement preparation resources.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In to Continue</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold">Comprehensive Programming Study Guide</h1>
                        <p className="text-lg text-muted-foreground mt-2">A merged collection of Mettl and common array problems.</p>
                    </header>

                    <nav className="flex justify-center items-center mb-8 bg-muted p-2 rounded-lg shadow-sm max-w-sm mx-auto">
                        <div className="flex space-x-1 w-full">
                           <Button 
                                variant={filter === 'all' ? 'default' : 'ghost'} 
                                onClick={() => setFilter('all')}
                                className="flex-1"
                            >
                                All
                            </Button>
                            <Button 
                                variant={filter === 'sql' ? 'default' : 'ghost'} 
                                onClick={() => setFilter('sql')}
                                className="flex-1"
                            >
                                SQL
                            </Button>
                            <Button 
                                variant={filter === 'coding' ? 'default' : 'ghost'} 
                                onClick={() => setFilter('coding')}
                                className="flex-1"
                            >
                                Coding
                            </Button>
                        </div>
                    </nav>

                    <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredProblems.map(problem => (
                            <Card key={problem.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-xl">{problem.id}. {problem.title}</CardTitle>
                                        <Badge variant="secondary">
                                            {problem.category === 'sql' ? <Database className="mr-1.5 h-3 w-3"/> : <Code className="mr-1.5 h-3 w-3"/>}
                                            {problem.category.charAt(0).toUpperCase() + problem.category.slice(1)}
                                        </Badge>
                                    </div>
                                    {problem.tables && <CardDescription className="font-mono text-xs pt-2">Table(s): {problem.tables}</CardDescription>}
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <p className="text-muted-foreground">{problem.description}</p>
                                </CardContent>
                                <CardFooter>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="item-1" className="border-none">
                                            <AccordionTrigger>Show Solution</AccordionTrigger>
                                            <AccordionContent>
                                                <Tabs defaultValue={problem.solutions[0].lang} className="w-full">
                                                    <TabsList className={cn("grid w-full", `grid-cols-${problem.solutions.length}`)}>
                                                        {problem.solutions.map(sol => (
                                                            <TabsTrigger key={sol.lang} value={sol.lang}>{sol.lang}</TabsTrigger>
                                                        ))}
                                                    </TabsList>
                                                    {problem.solutions.map(sol => (
                                                        <TabsContent key={sol.lang} value={sol.lang}>
                                                            <div className="bg-foreground text-background p-4 rounded-md overflow-x-auto text-sm font-mono mt-2">
                                                                <pre><code>{sol.code}</code></pre>
                                                            </div>
                                                        </TabsContent>
                                                    ))}
                                                </Tabs>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardFooter>
                            </Card>
                        ))}
                    </main>

                     <footer className="text-center mt-12 border-t pt-8">
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2">
                                    <BrainCircuit className="h-6 w-6" />
                                    General Mettl Exam Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-left text-muted-foreground space-y-2">
                                <p><strong>✓ SQL:</strong> Always use uppercase keywords. Ensure column aliases in your `SELECT` statement match the required output format exactly, using double quotes if they contain spaces.</p>
                                <p><strong>✓ Language Solutions:</strong> For problems involving element usage tracking, a `boolean[] used` array is a standard, reliable approach. For block-based problems, a `while` loop to control the main index is often cleaner than a `for` loop.</p>
                                <p><strong>✓ Dry Run:</strong> Before submitting, manually trace the provided examples through your code to confirm your logic is correct.</p>
                                <p><strong>✓ Output Format:</strong> Pay close attention to the expected output format. A correct answer with incorrect formatting will fail.</p>
                            </CardContent>
                        </Card>
                    </footer>
                </div>
            </main>
            <Footer />
        </div>
    );
}

    