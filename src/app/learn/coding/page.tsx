
'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Code, Database, BrainCircuit, Play, Coffee, FileJson, Hash } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { problems } from '@/lib/placement-prep-data';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type FilterType = 'all' | 'sql' | 'coding';

export default function LearnCodingPage() {
    const { loading } = useAuth();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredProblems = useMemo(() => {
        if (filter === 'all') {
            return problems;
        }
        return problems.filter(p => p.category === filter);
    }, [filter]);

    const sandboxLanguages = [
        { name: 'Sandbox', icon: Play, url: 'https://www.onlinegdb.com/' },
        { name: 'Java', icon: Coffee, url: 'https://www.online-java.com/' },
        { name: 'C++', icon: FileJson, url: 'https://www.onlinegdb.com/online_c++_compiler' },
        { name: 'C#', icon: Hash, url: 'https://www.onlinegdb.com/online_csharp_compiler' }
    ];

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary"/>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold">Comprehensive Programming Study Guide</h1>
                <p className="text-md text-muted-foreground mt-2">A merged collection of Mettl and common array problems.</p>
            </header>
            
            <section>
                <h2 className="text-xl font-semibold mb-4 text-center">Coding Sandboxes</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sandboxLanguages.map(lang => (
                        <Card key={lang.name} className="text-center">
                            <CardContent className="p-6">
                                <lang.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">{lang.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">Practice in a live environment.</p>
                                <Button asChild>
                                    <Link href={lang.url} target="_blank" rel="noopener noreferrer">
                                        <Play className="mr-2 h-4 w-4" /> Start Coding
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            
            <nav className="flex justify-center items-center bg-card p-1 rounded-lg shadow-sm max-w-sm mx-auto border">
                <div className="flex space-x-1 w-full">
                   <Button 
                        variant={filter === 'all' ? 'secondary' : 'ghost'} 
                        onClick={() => setFilter('all')}
                        className="flex-1"
                    >
                        All
                    </Button>
                    <Button 
                        variant={filter === 'sql' ? 'secondary' : 'ghost'} 
                        onClick={() => setFilter('sql')}
                        className="flex-1"
                    >
                        SQL
                    </Button>
                    <Button 
                        variant={filter === 'coding' ? 'secondary' : 'ghost'} 
                        onClick={() => setFilter('coding')}
                        className="flex-1"
                    >
                        Coding
                    </Button>
                </div>
            </nav>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProblems.map(problem => (
                    <Card key={problem.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-xl">{problem.id}. {problem.title}</CardTitle>
                                <Badge variant="outline">
                                    {problem.category === 'sql' ? <Database className="mr-1.5 h-3 w-3"/> : <Code className="mr-1.5 h-3 w-3"/>}
                                    {problem.category.charAt(0).toUpperCase() + problem.category.slice(1)}
                                </Badge>
                            </div>
                            {problem.tables && <CardDescription className="font-mono text-xs pt-2">Table(s): {problem.tables}</CardDescription>}
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-muted-foreground text-sm">{problem.description}</p>
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
        </div>
    );
}
