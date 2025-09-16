
'use client';

import { useState } from 'react';
import type { Mcq } from '@/app/actions/manage-mcqs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowRight, CheckCircle, XCircle, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface McqQuizProps {
  mcqs: Mcq[];
  courseName: string;
}

export function McqQuiz({ mcqs, courseName }: McqQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentQuestion = mcqs[currentQuestionIndex];
  const isFinished = currentQuestionIndex >= mcqs.length;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
  };

  const getOptionLabelClassName = (optionKey: string) => {
    if (!isAnswered) return 'border-border';
    if (optionKey === currentQuestion.correctAnswer) {
      return 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400';
    }
    if (optionKey === selectedAnswer) {
      return 'border-destructive bg-destructive/10 text-destructive dark:text-red-400';
    }
    return 'border-border opacity-60';
  };

  if (isFinished) {
    const score = (correctAnswers / mcqs.length) * 100;
    return (
      <Card className="flex flex-col h-full border-none shadow-none">
        <CardHeader className="text-center">
            <Trophy className="h-12 w-12 mx-auto text-amber-500" />
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>You finished the quiz for {courseName}.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
             <p className="text-lg text-muted-foreground">Your Score</p>
             <p className="text-6xl font-bold text-primary">{score.toFixed(0)}%</p>
             <p className="text-muted-foreground">{correctAnswers} out of {mcqs.length} correct</p>
        </CardContent>
        <CardFooter className="justify-center">
            <Button onClick={handleRestart}>
                <Sparkles className="mr-2 h-4 w-4" /> Try Again
            </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full border-none shadow-none">
      <CardHeader>
        <CardTitle>Quiz: {courseName}</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {mcqs.length}</CardDescription>
        <Progress value={((currentQuestionIndex + 1) / mcqs.length) * 100} className="mt-2"/>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-6">
        <div className="font-semibold text-lg">{currentQuestion.question}</div>
        <RadioGroup value={selectedAnswer || ''} onValueChange={setSelectedAnswer} disabled={isAnswered}>
          {currentQuestion.options.map((option) => (
            <Label
              key={option.key}
              htmlFor={`${currentQuestion.questionNumber}-${option.key}`}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                 getOptionLabelClassName(option.key)
              )}
            >
              <RadioGroupItem value={option.key} id={`${currentQuestion.questionNumber}-${option.key}`} />
              <span>{option.text}</span>
              {isAnswered && (
                <div className="ml-auto">
                    {option.key === currentQuestion.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500"/>}
                    {option.key === selectedAnswer && option.key !== currentQuestion.correctAnswer && <XCircle className="h-5 w-5 text-destructive"/>}
                </div>
              )}
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-end">
            {isAnswered ? (
                <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex === mcqs.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
                    Submit Answer
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
