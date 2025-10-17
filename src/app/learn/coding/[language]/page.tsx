
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const dummyQuestions = {
    easy: [
        { id: 1, title: 'Two Sum', description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.' },
        { id: 2, title: 'Reverse a String', description: 'Write a function that reverses a string. The input string is given as an array of characters.' },
        { id: 3, title: 'Palindrome Number', description: 'Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.' },
    ],
    medium: [
        { id: 4, title: 'Add Two Numbers', description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit.' },
        { id: 5, title: 'Longest Substring Without Repeating Characters', description: 'Given a string, find the length of the longest substring without repeating characters.' },
        { id: 6, title: '3Sum', description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.' },
    ],
    hard: [
        { id: 7, title: 'Median of Two Sorted Arrays', description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.' },
        { id: 8, title: 'Trapping Rain Water', description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.' },
        { id: 9, title: 'Regular Expression Matching', description: 'Given an input string (s) and a pattern (p), implement regular expression matching with support for \'.\' and \'*\'.' },
    ],
};

const languageDisplayNames: { [key: string]: string } = {
  java: 'Java',
  python: 'Python',
  cpp: 'C++',
  c: 'C',
};

export default function LanguagePracticePage() {
    const params = useParams();
    const language = Array.isArray(params.language) ? params.language[0] : params.language;
    const displayName = languageDisplayNames[language] || 'Coding';

    return (
        <div className="space-y-6">
             <header className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold">{displayName} Practice Problems</h1>
                <p className="text-md text-muted-foreground mt-2">Select a problem to start solving.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {Object.entries(dummyQuestions).map(([difficulty, questions]) => (
                    <Card key={difficulty}>
                        <CardHeader>
                            <CardTitle className="capitalize flex items-center gap-2">
                                <Badge variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'secondary' : 'destructive'} className="capitalize">{difficulty}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {questions.map(q => (
                                <Link key={q.id} href={`/tools/sandbox?language=${language}`} className="block p-3 rounded-md hover:bg-muted transition-colors">
                                    <p className="font-semibold">{q.id}. {q.title}</p>
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
