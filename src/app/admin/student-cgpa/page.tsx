
'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, ArrowUpDown } from "lucide-react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface User {
    id: string;
    name: string;
    email: string;
    regNo?: string;
    photoURL?: string;
}

interface CgpaData {
    cgpa: number;
    totalCredits: number;
}

interface StudentCgpa extends User {
    cgpaData?: CgpaData;
}

type SortKey = 'name' | 'regNo' | 'cgpa';
type SortDirection = 'asc' | 'desc';

export default function AdminStudentCgpaPage() {
    const [students, setStudents] = useState<StudentCgpa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [cgpaRange, setCgpaRange] = useState<[number, number]>([0, 10]);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });
    const { toast } = useToast();

    const fetchStudentData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all users
            const usersQuery = query(collection(db, 'users'));
            const usersSnapshot = await getDocs(usersQuery);
            const usersData: User[] = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

            // Fetch all CGPA data
            const cgpaQuery = query(collection(db, 'students_cgpa'));
            const cgpaSnapshot = await getDocs(cgpaQuery);
            const cgpaDataMap = new Map<string, CgpaData>();
            cgpaSnapshot.forEach(doc => {
                cgpaDataMap.set(doc.id, doc.data() as CgpaData);
            });

            // Combine data
            const combinedData: StudentCgpa[] = usersData.map(user => ({
                ...user,
                cgpaData: cgpaDataMap.get(user.id),
            }));

            setStudents(combinedData);

        } catch (error) {
            console.error("Error fetching student data:", error);
            toast({
                title: "Error",
                description: "Could not fetch student CGPA data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStudentData();
    }, [fetchStudentData]);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedStudents = useMemo(() => {
        let filtered = students.filter(student => {
            const lowerSearch = searchTerm.toLowerCase();
            const nameMatch = student.name?.toLowerCase().includes(lowerSearch);
            const regNoMatch = student.regNo?.toLowerCase().includes(lowerSearch);
            const cgpa = student.cgpaData?.cgpa ?? 0;
            const cgpaMatch = cgpa >= cgpaRange[0] && cgpa <= cgpaRange[1];
            return (nameMatch || regNoMatch) && cgpaMatch;
        });

        return filtered.sort((a, b) => {
            let aValue, bValue;
            switch(sortConfig.key) {
                case 'cgpa':
                    aValue = a.cgpaData?.cgpa ?? -1;
                    bValue = b.cgpaData?.cgpa ?? -1;
                    break;
                case 'regNo':
                    aValue = a.regNo ?? '';
                    bValue = b.regNo ?? '';
                    break;
                default: // name
                    aValue = a.name ?? '';
                    bValue = b.name ?? '';
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    }, [searchTerm, students, cgpaRange, sortConfig]);

    const getSortIcon = (key: SortKey) => {
      if (sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
      }
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Student CGPA Overview</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Student Data</CardTitle>
                    <CardDescription>
                        View and filter student CGPA records.
                    </CardDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or registration no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                             <Label htmlFor="cgpa-range">CGPA Range</Label>
                             <span className="text-sm font-medium">{cgpaRange[0].toFixed(1)} - {cgpaRange[1].toFixed(1)}</span>
                           </div>
                           <Slider
                                id="cgpa-range"
                                min={0}
                                max={10}
                                step={0.1}
                                value={cgpaRange}
                                onValueChange={(value) => setCgpaRange(value as [number, number])}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                  <Button variant="ghost" onClick={() => handleSort('name')}>
                                      User {getSortIcon('name')}
                                  </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => handleSort('regNo')}>
                                        Registration No. {getSortIcon('regNo')}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" onClick={() => handleSort('cgpa')}>
                                        CGPA {getSortIcon('cgpa')}
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredAndSortedStudents.length > 0 ? (
                                filteredAndSortedStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={student.photoURL} alt={student.name} />
                                                    <AvatarFallback>{student.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{student.name || 'N/A'}</div>
                                                    <div className="text-sm text-muted-foreground">{student.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono">{student.regNo || 'Not Provided'}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {student.cgpaData ? (
                                                <div className="font-semibold text-lg">{student.cgpaData.cgpa.toFixed(2)}</div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No students match your search criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
