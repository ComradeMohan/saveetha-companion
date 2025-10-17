
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { dummyProblemsByLanguage } from '@/lib/coding-problems';

const languageDisplayNames: { [key: string]: string } = {
  java: 'Java',
  python: 'Python',
  cpp: 'C++',
  c: 'C',
};

type LanguageKey = keyof typeof dummyProblemsByLanguage;

export default function LanguagePracticePage() {
    const params = useParams();
    const language = (Array.isArray(params.language) ? params.language[0] : params.language) as LanguageKey;
    const displayName = languageDisplayNames[language] || 'Coding';
    const problems = dummyProblemsByLanguage[language] || { easy: [], medium: [], hard: [] };
    const difficulties = ['easy', 'medium', 'hard'] as const;

    return (
        <div className="space-y-6">
             <header className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold">{displayName} Practice Problems</h1>
                <p className="text-md text-muted-foreground mt-2">Select a problem to start solving.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {difficulties.map((difficulty) => (
                    <Card key={difficulty}>
                        <CardHeader>
                            <CardTitle className="capitalize flex items-center gap-2">
                                <Badge variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive'} className="capitalize">{difficulty}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {problems[difficulty].map(q => (
                                <Link key={q.id} href={`/learn/coding/${language}/${q.id}`} className="block p-3 rounded-md hover:bg-muted transition-colors">
                                    <p className="font-semibold">{q.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{q.description}</p>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
