'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Download, Users, Mail, Phone, ArrowUpDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { getRecruitmentSubmissions, type RecruitmentSubmission } from '@/app/actions/get-recruitment-submissions';
import { Button } from '@/components/ui/button';

type SortKey = 'name' | 'batch' | 'submittedAt';
type SortDirection = 'asc' | 'desc';

export default function AdminRecruitmentPage() {
  const [submissions, setSubmissions] = useState<RecruitmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'submittedAt', direction: 'desc' });
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecruitmentSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Could not fetch recruitment submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);
  
  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  }


  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission =>
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.personalEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.batch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
        let aValue, bValue;
        switch(sortConfig.key) {
            case 'batch':
                aValue = a.batch;
                bValue = b.batch;
                break;
            case 'submittedAt':
                aValue = a.submittedAt ? parseISO(a.submittedAt).getTime() : 0;
                bValue = b.submittedAt ? parseISO(b.submittedAt).getTime() : 0;
                break;
            default: // name
                aValue = a.name;
                bValue = b.name;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

  }, [searchTerm, submissions, sortConfig]);

  const exportToCsv = () => {
    const headers = ["Name", "Student Email", "Personal Email", "Registration No.", "Batch", "Submitted At"];
    const csvRows = [headers.join(",")];

    filteredAndSortedSubmissions.forEach(sub => {
        const row = [
            `"${sub.name}"`,
            `"${sub.userEmail}"`,
            `"${sub.personalEmail}"`,
            `"${sub.regNo}"`,
            `"${sub.batch}"`,
            `"${format(parseISO(sub.submittedAt), 'yyyy-MM-dd HH:mm:ss')}"`
        ];
        csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `recruitment_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Recruitment Submissions</h2>
      <p className="text-muted-foreground">
        View all students who have expressed interest in helping manage the website.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Interested Students</CardTitle>
          <CardDescription>A list of all submitted interest forms.</CardDescription>
          <div className="flex justify-between items-center pt-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
                />
            </div>
            <Button variant="outline" onClick={exportToCsv} disabled={submissions.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')} className="px-0">
                        Student {getSortIcon('name')}
                    </Button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('batch')} className="px-0">
                        Batch {getSortIcon('batch')}
                    </Button>
                </TableHead>
                <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('submittedAt')} className="px-0">
                        Submitted {getSortIcon('submittedAt')}
                    </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedSubmissions.length > 0 ? (
                filteredAndSortedSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                        <p>{sub.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{sub.regNo}</p>
                    </TableCell>
                    <TableCell>
                        <a href={`mailto:${sub.userEmail}`} className="flex items-center gap-1.5 text-xs hover:underline"><Users className="h-3 w-3"/> {sub.userEmail}</a>
                        <a href={`mailto:${sub.personalEmail}`} className="flex items-center gap-1.5 text-xs hover:underline"><Mail className="h-3 w-3"/> {sub.personalEmail}</a>
                    </TableCell>
                    <TableCell>{sub.batch}</TableCell>
                    <TableCell className="text-right">{format(parseISO(sub.submittedAt), 'PPP')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No submissions found.
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
