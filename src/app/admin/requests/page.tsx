
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, doc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FacultyRequest {
  id: string;
  name: string;
  phone: string;
  department: string;
  roomNo?: string;
  status: 'pending';
  createdAt: string; // Changed to string to match submitted data
}

export default function AdminFacultyRequestsPage() {
  const [requests, setRequests] = useState<FacultyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
        const q = query(collection(db, 'faculty-requests'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const requestsData: FacultyRequest[] = [];
        snapshot.forEach((doc) => {
            requestsData.push({ id: doc.id, ...doc.data() } as FacultyRequest);
        });
        setRequests(requestsData);
    } catch (error) {
        console.error('Error fetching faculty requests:', error);
        toast({
            title: 'Error',
            description: 'Could not fetch faculty requests.',
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (request: FacultyRequest) => {
    setProcessingId(request.id);
    try {
      // Add to main faculty collection
      await addDoc(collection(db, 'faculty'), {
        name: request.name,
        phone: request.phone,
        department: request.department,
        roomNo: request.roomNo || '',
        subjects: [], // Subjects can be edited later by an admin
        createdAt: new Date().toISOString(),
      });

      // Delete the request
      await deleteDoc(doc(db, 'faculty-requests', request.id));
      fetchRequests(); // Refetch requests

      toast({
        title: 'Approved!',
        description: `${request.name} has been added to the faculty directory.`,
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Could not approve the request.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await deleteDoc(doc(db, 'faculty-requests', requestId));
      fetchRequests(); // Refetch requests
      toast({
        title: 'Rejected',
        description: 'The faculty suggestion has been rejected.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Could not reject the request.',
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
          <h2 className="text-3xl font-bold tracking-tight">Faculty Requests</h2>
          <p className="text-muted-foreground">
            Review and approve new faculty member suggestions from students.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            Approve a request to add it to the main faculty directory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department/Subject</TableHead>
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
                    <TableCell className="font-medium">
                      {req.name}
                      {req.roomNo && <div className="text-xs text-muted-foreground">Room: {req.roomNo}</div>}
                    </TableCell>
                    <TableCell>{req.phone}</TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>
                      {req.createdAt ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      {processingId === req.id ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(req)}>
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>
                            <X className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No pending requests.</p>
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
