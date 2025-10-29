'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileJson, Info } from 'lucide-react';
import { getCourseFiles } from '@/app/actions/manage-course-files';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CourseFilesPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const fileList = await getCourseFiles();
      setFiles(fileList);
    } catch (error) {
      console.error("Error fetching course files:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Course Content Files</h2>
        <p className="text-muted-foreground">A list of all course content JSON files in the `public/courses` directory.</p>
      </div>

       <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How It Works</AlertTitle>
          <AlertDescription>
           This page shows the JSON files that power the student learning zone. To add or update course content, add or replace a JSON file in the `public/courses` folder in your project's source code and redeploy the application.
          </AlertDescription>
        </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Available Course Files</CardTitle>
          <CardDescription>
            Each file represents a course. The filename (e.g., `UBA01.json`) must match the course code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={1} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : files.length > 0 ? (
                files.map((file) => (
                  <TableRow key={file}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4 text-primary" />
                        <span>{file}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={1} className="h-24 text-center">
                    No course files found in `public/courses`.
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
