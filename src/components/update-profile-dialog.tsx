
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getColleges } from '@/app/actions/manage-colleges';
import { getDepartments } from '@/app/actions/manage-departments';

const profileSchema = z.object({
  college: z.string().min(1, 'Please select your college.'),
  department: z.string().min(1, 'Please select a department.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type College = { id: string; name: string };
type Department = { id: string; name: string };

interface UpdateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateProfileDialog({ open, onOpenChange }: UpdateProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const { updateUserAcademicProfile, setIsNavigating } = useAuth();
  const router = useRouter();

  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const selectedCollege = form.watch('college');

  useEffect(() => {
    const fetchColleges = async () => {
        setLoadingColleges(true);
        const collegeData = await getColleges();
        setColleges(collegeData as College[]);
        setLoadingColleges(false);
    };
    if (open) {
        fetchColleges();
    }
  }, [open]);

  useEffect(() => {
      const fetchDepartments = async () => {
          if (selectedCollege) {
              setLoadingDepartments(true);
              form.setValue('department', ''); // Reset department on college change
              const departmentData = await getDepartments(selectedCollege);
              setDepartments(departmentData as Department[]);
              setLoadingDepartments(false);
          } else {
              setDepartments([]);
          }
      };
      fetchDepartments();
  }, [selectedCollege, form]);


  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      await updateUserAcademicProfile(values);
      onOpenChange(false); // Close dialog on success
      setIsNavigating(true);
      router.push('/learn'); // Navigate to learn page
    } catch (error) {
      // Error toast is handled in the auth hook
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            To personalize your learning experience, please provide the following details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingColleges}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingColleges ? "Loading colleges..." : "Select your college"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colleges.map(college => (
                          <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCollege || loadingDepartments}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedCollege ? "First, select a college" : loadingDepartments ? "Loading departments..." : "Select your department"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map(dep => (
                        <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save and Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
