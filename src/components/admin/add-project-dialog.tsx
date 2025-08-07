
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.enum(['Hardware', 'Software', 'Digital Asset']),
  thumbnail: z
    .custom<File>(val => val instanceof File, 'Thumbnail is required.')
    .refine(file => file.size <= MAX_FILE_SIZE, `Max thumbnail size is 5MB.`)
    .refine(
      file => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  files: z.array(z.custom<File>()).min(1, 'At least one project file is required.'),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface AddProjectDialogProps {
    onProjectAdded: () => void;
}

export function AddProjectDialog({ onProjectAdded }: AddProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      files: [],
      category: undefined,
      thumbnail: undefined,
    },
  });
  
  const uploadedFiles = form.watch('files');

  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error("User not authenticated");
    // Ensure the filepath includes the user's ID for proper RLS policy application
    const filePath = `projects/${user.uid}/${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage.from('project-files').upload(filePath, file);

    if (error) {
      // The error message from Supabase is now more likely to be about RLS.
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (values: ProjectFormValues) => {
    setLoading(true);
    try {
      const thumbnailUrl = await uploadFile(values.thumbnail);

      const uploadedFilesData = await Promise.all(values.files.map(async file => {
        const url = await uploadFile(file);
        return { name: file.name, url, type: file.type, size: file.size };
      }));

      await addDoc(collection(db, 'projects'), {
        title: values.title,
        description: values.description,
        category: values.category,
        thumbnailUrl,
        files: uploadedFilesData,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Project added successfully.',
      });
      onProjectAdded();
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: `Failed to add project: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Fill in the details for the new project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-4 pr-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl><Input placeholder="e.g., AI-Powered Chatbot" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Describe the project..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Digital Asset">Digital Asset</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                            <FormLabel>Thumbnail Image</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0])} {...rest} />
                            </FormControl>
                             <FormDescription>A single image that represents the project.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Controller
                  control={form.control}
                  name="files"
                  render={({ field: { onChange, value }, fieldState }) => (
                    <FormItem>
                        <FormLabel>Project Files</FormLabel>
                        <FormControl>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, PPTX, DOCX, ZIP, etc.</p>
                                    </div>
                                    <input id="dropzone-file" type="file" multiple className="hidden" onChange={e => onChange([...(value || []), ...Array.from(e.target.files!)])} />
                                </label>
                            </div>
                        </FormControl>
                        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                        {uploadedFiles && uploadedFiles.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <h4 className="text-sm font-medium">Uploaded files:</h4>
                                <div className="space-y-1">
                                    {uploadedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-1.5 bg-muted rounded-md text-sm">
                                            <span className="truncate pr-2">{file.name}</span>
                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                const newFiles = [...uploadedFiles];
                                                newFiles.splice(i, 1);
                                                onChange(newFiles);
                                            }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
