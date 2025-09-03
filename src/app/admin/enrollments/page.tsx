
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search } from 'lucide-react';
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Enrollment {
  id: string;
  name: string;
  email: string;
  courseCode: string;
  slot: string;
  createdAt: any;
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'enrollments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Enrollment[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Enrollment);
      });
      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "Error",
        description: "Could not fetch enrollments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const filteredEnrollments = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) {
      return enrollments;
    }
    return enrollments.filter(enrollment =>
      enrollment.name.toLowerCase().includes(lowercasedFilter) ||
      enrollment.email.toLowerCase().includes(lowercasedFilter) ||
      enrollment.courseCode.toLowerCase().includes(lowercasedFilter) ||
      enrollment.slot.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, enrollments]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Enrollment Alerts</h2>
      <p className="text-muted-foreground">
        View all student course enrollment alerts submitted through the portal.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Submissions</CardTitle>
          <CardDescription>A list of all submitted course enrollment alerts.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/2"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Submitted On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.name}</TableCell>
                    <TableCell>{enrollment.email}</TableCell>
                    <TableCell>{enrollment.courseCode}</TableCell>
                    <TableCell>{enrollment.slot}</TableCell>
                    <TableCell>
                      {enrollment.createdAt ? format(enrollment.createdAt.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No enrollments found.
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
