
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Edit, Link as LinkIcon, Instagram, Github, Linkedin, Globe, FileText, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScrollArea } from '../ui/scroll-area';
import type { PDDProject } from '@/types/pdd-project';

const urlSchema = z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal(''));

const projectSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  instagramUrl: urlSchema,
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  websiteUrl: urlSchema,
  gpcuDocUrl: urlSchema,
  patentDocUrl: urlSchema,
  canvaUrl: urlSchema,
  figmaUrl: urlSchema,
  gslidesUrl: urlSchema,
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const formFields = [
    { name: 'instagramUrl', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
    { name: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
    { name: 'githubUrl', label: 'GitHub', icon: Github, placeholder: 'https://github.com/...' },
    { name: 'websiteUrl', label: 'Website/App', icon: Globe, placeholder: 'https://...' },
    { name: 'gpcuDocUrl', label: 'GPCU Doc', icon: FileText, placeholder: 'https://docs.google.com/...' },
    { name: 'patentDocUrl', label: 'Patent Doc', icon: FileText, placeholder: 'https://patents.google.com/...' },
    { name: 'canvaUrl', label: 'Canva', icon: Presentation, placeholder: 'https://canva.com/design/...' },
    { name: 'figmaUrl', label: 'Figma', icon: 'Figma', placeholder: 'https://figma.com/...' },
    { name: 'gslidesUrl', label: 'Google Slides', icon: Presentation, placeholder: 'https://docs.google.com/presentation/...' },
] as const;


export function EditPddProjectDialog({ project, onProjectUpdated }: { project: PDDProject, onProjectUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title,
      instagramUrl: project.instagramUrl || '',
      linkedinUrl: project.linkedinUrl || '',
      githubUrl: project.githubUrl || '',
      websiteUrl: project.websiteUrl || '',
      gpcuDocUrl: project.gpcuDocUrl || '',
      patentDocUrl: project.patentDocUrl || '',
      canvaUrl: project.canvaUrl || '',
      figmaUrl: project.figmaUrl || '',
      gslidesUrl: project.gslidesUrl || '',
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    setLoading(true);
    try {
      const projectRef = doc(db, 'pdd-projects', project.id);
      await updateDoc(projectRef, values);
      toast({ title: 'Success', description: 'Project updated successfully.' });
      onProjectUpdated();
      setOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({ title: 'Error', description: 'Failed to update project.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Project: {project.title}</DialogTitle>
          <DialogDescription>Update the project links below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[60vh] -mr-4 pr-4">
                <div className="space-y-4 pr-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    {formFields.map(f => (
                        <FormField
                            key={f.name}
                            control={form.control}
                            name={f.name}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        {typeof f.icon === 'string' ? <LinkIcon className="h-4 w-4" /> : <f.icon className="h-4 w-4" />}
                                        {f.label}
                                    </FormLabel>
                                    <FormControl><Input placeholder={f.placeholder} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
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
