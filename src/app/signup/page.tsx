
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { LoginIssueDialog } from '@/components/login-issue-dialog';

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.').refine(email => email.endsWith('@saveetha.com'), {
    message: 'Please use an email ending with @saveetha.com',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const step2Schema = z.object({
  regNo: z.string().min(4, 'Registration number is required.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
});

const formSchema = step1Schema.merge(step2Schema);

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUpWithEmailAndPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(step === 1 ? step1Schema : formSchema),
    mode: 'onChange',
  });
  const { trigger, getValues } = form;

  const onInputChange = () => {
    if (error) {
      setError(null);
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(['name', 'email', 'password']);
    if (isValid) {
      setStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  }

  const handleEmailSignUp = async (data: SignUpFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmailAndPassword(data);
      toast({ 
        title: 'Verification Email Sent!',
        description: `We've sent a verification link to ${data.email}. Please check your inbox.`,
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 p-4 pt-24">
          <div className="hidden md:flex flex-col items-center justify-center gap-4 p-8 text-center auth-panel-bg">
              <div className="shape shape1"></div>
              <div className="shape shape2"></div>
              <div className="shape shape3"></div>
              <div className="shape shape4"></div>
              <div className="relative z-10">
                <h2 className="text-5xl font-extrabold tracking-tight animate-text-gradient">Join a Community of Innovators</h2>
                <p className="text-muted-foreground max-w-sm mt-4 text-lg">Create your account to unlock powerful tools and streamline your academic life.</p>
              </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Get started with your academic companion.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-2 mb-6">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>1</div>
                        <span className={cn("text-sm", step >= 1 ? "text-primary font-semibold" : "text-muted-foreground")}>Account</span>
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>2</div>
                        <span className={cn("text-sm", step >= 2 ? "text-primary font-semibold" : "text-muted-foreground")}>Details</span>
                      </div>
                  </div>

                <form onSubmit={form.handleSubmit(handleEmailSignUp)} className="space-y-4">
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            {...form.register('name')}
                            onChange={(e) => { form.setValue('name', e.target.value); onInputChange(); }}
                            disabled={loading}
                        />
                         {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">College Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@saveetha.com"
                            {...form.register('email')}
                            onChange={(e) => { form.setValue('email', e.target.value); onInputChange(); }}
                            disabled={loading}
                        />
                         {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                      </div>
                      <div className="space-y-2 relative">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'}
                            {...form.register('password')}
                            onChange={(e) => { form.setValue('password', e.target.value); onInputChange(); }}
                            minLength={6}
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-7 h-7 w-7"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                        </Button>
                         {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
                      </div>
                       <Button type="button" className="w-full" onClick={handleNextStep}>
                         Next
                       </Button>
                    </>
                  )}

                  {step === 2 && (
                    <>
                       <div className="space-y-2">
                        <Label htmlFor="regNo">Registration Number</Label>
                        <Input
                            id="regNo"
                            type="text"
                            placeholder="19YYDDRRR"
                            {...form.register('regNo')}
                            onChange={(e) => { form.setValue('regNo', e.target.value); onInputChange(); }}
                            disabled={loading}
                        />
                         {form.formState.errors.regNo && <p className="text-sm text-destructive">{form.formState.errors.regNo.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="9876543210"
                            {...form.register('phone')}
                            onChange={(e) => { form.setValue('phone', e.target.value); onInputChange(); }}
                            disabled={loading}
                        />
                         {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="w-1/3" onClick={handlePrevStep} disabled={loading}>
                           <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button type="submit" className="w-2/3" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Sign Up
                        </Button>
                      </div>
                    </>
                  )}
                </form>
                {error && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4"/>
                        <p>{error}</p>
                    </div>
                )}
                
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                    </Link>
                </p>
                </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <LoginIssueDialog />
      </div>
    </>
  );
}
