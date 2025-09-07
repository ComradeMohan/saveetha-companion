
'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, BookCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getColleges, addCollege, deleteCollege } from '@/app/actions/manage-colleges';
import { getDepartments, addDepartment, deleteDepartment } from '@/app/actions/manage-departments';
import { getCourses, addCourse, deleteCourse, seedCourses } from '@/app/actions/manage-courses';

type College = { id: string; name: string };
type Department = { id: string; name: string };
type Course = { id: string; name: string };

export default function CollegeLearningsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const [newCollegeId, setNewCollegeId] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');


  useEffect(() => {
    startTransition(async () => {
      const collegesData = await getColleges();
      setColleges(collegesData as College[]);
    });
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      startTransition(async () => {
        const departmentsData = await getDepartments(selectedCollege);
        setDepartments(departmentsData as Department[]);
        setCourses([]);
        setSelectedDepartment('');
      });
    } else {
      setDepartments([]);
      setCourses([]);
    }
  }, [selectedCollege]);

  useEffect(() => {
    if (selectedCollege && selectedDepartment) {
      startTransition(async () => {
        const coursesData = await getCourses(selectedCollege, selectedDepartment);
        setCourses(coursesData as Course[]);
      });
    } else {
      setCourses([]);
    }
  }, [selectedCollege, selectedDepartment]);

  const handleAction = (action: () => Promise<{ type: string; message: string; [key: string]: any }>) => {
    startTransition(async () => {
      const result = await action();
      toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
        variant: result.type === 'error' ? 'destructive' : 'default',
      });
      if (result.type === 'success') {
          // Refetch data
          const collegesData = await getColleges();
          setColleges(collegesData as College[]);
          if(selectedCollege) {
              const departmentsData = await getDepartments(selectedCollege);
              setDepartments(departmentsData as Department[]);
          }
          if(selectedCollege && selectedDepartment) {
              const coursesData = await getCourses(selectedCollege, selectedDepartment);
              setCourses(coursesData as Course[]);
          }
      }
    });
  };

  const handleAddCollege = () => {
      const formData = new FormData();
      formData.append('id', newCollegeId);
      formData.append('name', newCollegeName);
      handleAction(() => addCollege(formData));
      setNewCollegeId('');
      setNewCollegeName('');
  }
  const handleDeleteCollege = (id: string) => handleAction(() => deleteCollege(id));
  
  const handleAddDepartment = () => {
      const formData = new FormData();
      formData.append('collegeId', selectedCollege);
      formData.append('id', newDepartmentId);
      formData.append('name', newDepartmentName);
      handleAction(() => addDepartment(formData));
      setNewDepartmentId('');
      setNewDepartmentName('');
  }
  const handleDeleteDepartment = (id: string) => handleAction(() => deleteDepartment(selectedCollege, id));

  const handleAddCourse = () => {
      const formData = new FormData();
      formData.append('collegeId', selectedCollege);
      formData.append('departmentId', selectedDepartment);
      formData.append('code', newCourseCode);
      formData.append('name', newCourseName);
      handleAction(() => addCourse(formData));
      setNewCourseCode('');
      setNewCourseName('');
  }
  const handleDeleteCourse = (code: string) => handleAction(() => deleteCourse(selectedCollege, selectedDepartment, code));
  const handleSeedCourses = () => handleAction(() => seedCourses(selectedCollege, selectedDepartment));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">College Learnings</h2>
        <p className="text-muted-foreground">Manage colleges, departments, and their respective courses.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Colleges */}
        <Card>
          <CardHeader>
            <CardTitle>Colleges</CardTitle>
            <CardDescription>Manage the list of colleges.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {colleges.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                  <span>{c.name} ({c.id})</span>
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteCollege(c.id)} disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                   </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-stretch">
            <Input placeholder="College ID (e.g., SSE)" value={newCollegeId} onChange={e => setNewCollegeId(e.target.value)} />
            <Input placeholder="College Name" value={newCollegeName} onChange={e => setNewCollegeName(e.target.value)} />
            <Button onClick={handleAddCollege} disabled={isPending || !newCollegeId || !newCollegeName}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>} Add College
            </Button>
          </CardFooter>
        </Card>

        {/* Departments */}
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage departments for the selected college.</CardDescription>
            <Select onValueChange={setSelectedCollege} value={selectedCollege}>
              <SelectTrigger><SelectValue placeholder="Select a College" /></SelectTrigger>
              <SelectContent>
                {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
              {departments.map(d => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                  <span>{d.name} ({d.id})</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(d.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-stretch">
            <Input placeholder="Dept. ID (e.g., CSE)" value={newDepartmentId} onChange={e => setNewDepartmentId(e.target.value)} disabled={!selectedCollege}/>
            <Input placeholder="Dept. Name" value={newDepartmentName} onChange={e => setNewDepartmentName(e.target.value)} disabled={!selectedCollege}/>
            <Button onClick={handleAddDepartment} disabled={isPending || !selectedCollege || !newDepartmentId || !newDepartmentName}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>} Add Department
            </Button>
          </CardFooter>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>Manage courses for the selected department.</CardDescription>
            <Select onValueChange={setSelectedDepartment} value={selectedDepartment} disabled={!selectedCollege}>
              <SelectTrigger><SelectValue placeholder="Select a Department"/></SelectTrigger>
              <SelectContent>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
             <div className="space-y-2 max-h-60 overflow-y-auto">
              {courses.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                  <span>{c.name} ({c.id})</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(c.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-stretch">
            <Input placeholder="Course Code" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} disabled={!selectedDepartment}/>
            <Input placeholder="Course Name" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} disabled={!selectedDepartment}/>
            <Button onClick={handleAddCourse} disabled={isPending || !selectedDepartment || !newCourseCode || !newCourseName}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>} Add Course
            </Button>
            <Button variant="outline" onClick={handleSeedCourses} disabled={isPending || !selectedDepartment}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookCopy className="mr-2 h-4 w-4"/>} Seed CSE Courses
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
