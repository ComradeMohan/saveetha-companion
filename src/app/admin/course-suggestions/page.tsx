
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CourseSuggestion {
  id: string;
  courseCode: string;
  courseName: string;
  suggestedBy: string;
  suggesterEmail: string;
  status: 'pending';
  createdAt: any; 
}

export default function AdminCourseSuggestionsPage() {
  const [requests, setRequests] = useState<CourseSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
        const q = query(collection(db, 'course-suggestions'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const requestsData: CourseSuggestion[] = [];
        snapshot.forEach((doc) => {
            requestsData.push({ id: doc.id, ...doc.data() } as CourseSuggestion);
        });
        setRequests(requestsData);
    } catch (error) {
        console.error('Error fetching course suggestions:', error);
        toast({
            title: 'Error',
            description: 'Could not fetch course suggestions.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);


  const handleDismiss = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await deleteDoc(doc(db, 'course-suggestions', requestId));
      fetchRequests(); 
      toast({
        title: 'Dismissed',
        description: 'The course suggestion has been dismissed.',
      });
    } catch (error) {
      console.error('Error dismissing request:', error);
      toast({
        title: 'Error',
        description: 'Could not dismiss the request.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Course Suggestions</h2>
          <p className="text-muted-foreground">
            Review and manage missing course suggestions from students.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Suggestions</CardTitle>
          <CardDescription>
            Add these courses via the College Learnings page, then dismiss the suggestion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Suggested By</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono">{req.courseCode}</TableCell>
                    <TableCell>{req.courseName}</TableCell>
                     <TableCell>
                        <div className="font-medium">{req.suggesterEmail}</div>
                    </TableCell>
                    <TableCell>
                      {req.createdAt ? formatDistanceToNow(new Date(req.createdAt.toDate()), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      {processingId === req.id ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleDismiss(req.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Dismiss
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No pending course suggestions.</p>
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
