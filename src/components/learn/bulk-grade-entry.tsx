
'use client';

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { FileText, Loader2, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

type Course = {
    id: string;
    name: string;
};

type ParsedGrade = {
    code: string;
    name: string;
    grade: string;
};

interface BulkGradeEntryProps {
    allCourses: Course[];
    existingGrades: Record<string, string>;
    onSave: (newGrades: Record<string, string>) => void;
}

const grades = ['S', 'A', 'B', 'C', 'D', 'E'];

export function BulkGradeEntry({ allCourses, existingGrades, onSave }: BulkGradeEntryProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [pastedText, setPastedText] = useState("");
    const [parsedGrades, setParsedGrades] = useState<ParsedGrade[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const courseMap = useMemo(() => {
        return new Map(allCourses.map(course => [course.id.toLowerCase(), course]));
    }, [allCourses]);

    const handleParse = () => {
        setIsParsing(true);
        // Regex to find potential course codes (3-4 uppercase letters followed by digits)
        // and a potential grade (S, A, B, C, D, E) on the same line.
        const gradeRegex = /\b([A-Z]{3,4}\d{1,2})\b/gi;
        const validGrades = new Set(grades);

        const lines = pastedText.split('\n');
        const foundGrades: ParsedGrade[] = [];
        const seenCodes = new Set<string>();

        lines.forEach(line => {
            const matches = line.match(gradeRegex);
            if (matches) {
                matches.forEach(codeMatch => {
                    const upperCode = codeMatch.toUpperCase();
                    if (!seenCodes.has(upperCode) && courseMap.has(upperCode.toLowerCase())) {
                        const gradeMatch = line.match(/\b([SABCDE])\b/i); // Find grade on the same line
                        if (gradeMatch) {
                            const grade = gradeMatch[0].toUpperCase();
                            if (validGrades.has(grade)) {
                                const course = courseMap.get(upperCode.toLowerCase());
                                if (course) {
                                    foundGrades.push({ code: course.id, name: course.name, grade });
                                    seenCodes.add(upperCode);
                                }
                            }
                        }
                    }
                });
            }
        });

        // Filter out grades that are already logged
        const newGrades = foundGrades.filter(g => !existingGrades.hasOwnProperty(g.code));
        setParsedGrades(newGrades);
        
        if(newGrades.length === 0 && foundGrades.length > 0) {
            toast({ title: "No new grades found", description: "All parsed grades have already been logged." });
        } else if (newGrades.length === 0) {
            toast({ title: "Parsing Complete", description: "Could not find any valid new course grades in the text.", variant: "destructive" });
        }

        setIsParsing(false);
    };

    const handleGradeChange = (code: string, newGrade: string) => {
        setParsedGrades(prev =>
            prev.map(g => (g.code === code ? { ...g, grade: newGrade } : g))
        );
    };

    const handleSaveAll = async () => {
        if (!user) {
            toast({ title: "Login Required", variant: "destructive" });
            return;
        }
        if (parsedGrades.length === 0) {
            toast({ title: "No grades to save", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        const newGradesToSave = parsedGrades.reduce((acc, grade) => {
            acc[grade.code] = grade.grade;
            return acc;
        }, {} as Record<string, string>);

        try {
            const docRef = doc(db, 'student_grades', user.uid);
            await setDoc(docRef, newGradesToSave, { merge: true });
            onSave(newGradesToSave);
            toast({ title: "Success", description: `${parsedGrades.length} grades have been saved.` });
            setParsedGrades([]);
            setPastedText("");
        } catch (error) {
            console.error("Error saving bulk grades:", error);
            toast({ title: "Error", description: "Failed to save grades.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Bulk Grade Entry (New)</CardTitle>
                <CardDescription>
                    Copy your grades from a document or table and paste them here. The AI will parse them for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Paste your grade information here..."
                    className="min-h-32"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                />
                 <Button onClick={handleParse} disabled={isParsing || !pastedText} className="mt-4">
                    {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Parse Grades
                </Button>
            </CardContent>

            {parsedGrades.length > 0 && (
                <>
                    <CardHeader>
                        <CardTitle>Confirm Grades</CardTitle>
                         <CardDescription>
                            We found {parsedGrades.length} new course grades. Review and edit if needed, then save.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="w-[120px]">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedGrades.map(g => (
                                    <TableRow key={g.code}>
                                        <TableCell>
                                            <p className="font-medium">{g.name}</p>
                                            <p className="text-sm text-muted-foreground font-mono">{g.code}</p>
                                        </TableCell>
                                        <TableCell>
                                             <Select value={g.grade} onValueChange={(newGrade) => handleGradeChange(g.code, newGrade)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {grades.map(grade => (
                                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleSaveAll} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save All {parsedGrades.length} Grades
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
