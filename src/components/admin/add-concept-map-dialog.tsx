
'use client';

import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Loader2, UploadCloud, File as FileIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumably, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Progress } from '../ui/progress';

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const conceptMapSchema = z.object({
  title: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      '.jpg, .jpeg, .png and .pdf files are accepted.'
    ),
});

type ConceptMapFormValues = z.infer<typeof conceptMapSchema>;

export function AddConceptMapDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<ConceptMapFormValues>({
    resolver: zodResolver(conceptMapSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('file', file);
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    form.resetField('file');
    setSelectedFile(null);
  };

  const onSubmit = async (values: ConceptMapFormValues) => {
    setLoading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `concept-maps/${Date.now()}_${values.file.name}`);
    const uploadTask = uploadBytesResumably(storageRef, values.file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({
          title: 'Upload Failed',
          description: 'Could not upload the file. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, 'concept-maps'), {
            title: values.title,
            url: downloadURL,
            description: '',
            createdAt: new Date().toISOString(),
          });

          toast({
            title: 'Success',
            description: 'Concept map added successfully.',
          });
          form.reset();
          setSelectedFile(null);
          setOpen(false);
        } catch (error) {
          console.error('Error adding concept map to Firestore:', error);
          toast({
            title: 'Error',
            description: 'Failed to save concept map details. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!loading) {
            setOpen(isOpen);
            if (!isOpen) {
                form.reset();
                setSelectedFile(null);
            }
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Concept Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Concept Map</DialogTitle>
          <DialogDescription>
            Provide a name and upload a PDF or image file for the new concept map.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concept Map Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Data Structures & Algorithms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File (PDF or Image)</FormLabel>
                  {selectedFile ? (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                           <FileIcon className="h-5 w-5 text-muted-foreground" />
                           <span className="text-sm text-muted-foreground truncate">{selectedFile.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={removeFile} className="h-6 w-6">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  ) : (
                  <FormControl>
                    <div className="relative">
                        <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept={ACCEPTED_FILE_TYPES.join(',')}
                            onChange={handleFileChange}
                            aria-label="Upload file"
                        />
                        <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md">
                           <div className="text-center">
                             <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground"/>
                             <p className="text-sm text-muted-foreground">Click or drag file to upload</p>
                           </div>
                        </div>
                    </div>
                  </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {loading && (
                <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
