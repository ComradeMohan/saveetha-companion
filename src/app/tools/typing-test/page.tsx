
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Keyboard as KeyboardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';

const paragraphs = [
    "The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the English alphabet. It is often used for practicing typing and testing fonts.",
    "Technology has revolutionized the way we live and work. From smartphones to artificial intelligence, its impact is undeniable and continues to shape our future.",
    "Programming is the process of creating a set of instructions that tell a computer how to perform a task. It is a fundamental skill in the digital age.",
    "The journey of a thousand miles begins with a single step. This ancient proverb reminds us that great things are accomplished through small, consistent efforts over time.",
    "Education is the most powerful weapon which you can use to change the world. Nelson Mandela spoke these words, highlighting the importance of learning and knowledge."
];

const TIME_LIMIT = 60; // 60 seconds

export default function TypingTestPage() {
    const [textToType, setTextToType] = useState('');
    const [userInput, setUserInput] = useState('');
    const [timer, setTimer] = useState(TIME_LIMIT);
    const [testStarted, setTestStarted] = useState(false);
    const [testFinished, setTestFinished] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startTest = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * paragraphs.length);
        setTextToType(paragraphs[randomIndex]);
        setUserInput('');
        setTimer(TIME_LIMIT);
        setTestStarted(false);
        setTestFinished(false);
        setWpm(0);
        setAccuracy(0);

        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        startTest();
    }, [startTest]);

    useEffect(() => {
        if (testStarted && timer > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setTestFinished(true);
            setTestStarted(false);
            calculateResults();
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testStarted, timer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (testFinished) return;

        const value = e.target.value;

        if (!testStarted && value.length > 0) {
            setTestStarted(true);
        }
        
        setUserInput(value);
    };
    
    const calculateResults = () => {
        const typedWords = userInput.trim().split(/\s+/);
        const correctWords = typedWords.filter((word, index) => {
            const originalWords = textToType.split(/\s+/);
            return word === originalWords[index];
        });
        
        const grossWpm = (userInput.length / 5) / (TIME_LIMIT / 60);
        setWpm(Math.round(grossWpm));

        const correctChars = userInput.split('').filter((char, index) => char === textToType[index]).length;
        const newAccuracy = (correctChars / userInput.length) * 100;
        setAccuracy(Math.round(newAccuracy) || 0);
    };

    const renderText = () => {
        return textToType.split('').map((char, index) => {
            let className = 'text-muted-foreground';
            if (index < userInput.length) {
                className = char === userInput[index] ? 'text-foreground' : 'text-destructive bg-destructive/20';
            }
            return <span key={index} className={cn('transition-colors', className)}>{char}</span>;
        });
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4">
                    <Card className="max-w-3xl mx-auto shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <KeyboardIcon className="h-6 w-6 text-primary" />
                                Typing Speed Test
                            </CardTitle>
                            <CardDescription>
                                How fast can you type? You have 60 seconds to type the text below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className="relative rounded-lg border p-4 text-lg font-mono tracking-wider leading-relaxed select-none"
                                onClick={() => inputRef.current?.focus()}
                            >
                                {renderText()}
                                 <div className="absolute inset-0 z-0">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={handleInputChange}
                                        className="w-full h-full opacity-0 cursor-default"
                                        disabled={testFinished}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Time Left</p>
                                    <p className="text-2xl font-bold">{timer}</s</p>
                                </div>
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Speed (WPM)</p>
                                    <p className="text-2xl font-bold">{wpm}</p>
                                </div>
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Accuracy</p>
                                    <p className="text-2xl font-bold">{accuracy}%</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Button onClick={startTest}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Restart Test
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
