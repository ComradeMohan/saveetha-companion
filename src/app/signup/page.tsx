
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoginIssueDialog } from '@/components/login-issue-dialog';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUpWithEmailAndPassword, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const checkUser = async () => {
        if (!authLoading && user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().regNo) {
                 router.push('/');
            } else {
                router.push('/complete-profile');
            }
        }
    }
    checkUser();
  }, [user, authLoading, router]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@saveetha.com')) {
      toast({
        title: 'Invalid Email',
        description: 'Please use an email ending with @saveetha.com',
        variant: 'destructive',
      });
      return;
    }

    if (!regNo.startsWith('19')) {
      toast({
        title: 'Invalid Registration Number',
        description: 'Please enter your correct registration number starting with 19.',
        variant: 'destructive',
      });
      return;
    }

    if (phone.length !== 10) {
       toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return;
    }

    setEmailLoading(true);
    try {
      await signUpWithEmailAndPassword({ name, regNo, phone, email, password });
      toast({ 
        title: 'Verification Email Sent!',
        description: `We've sent a verification link to ${email}. Please check your inbox.`,
      });
      router.push('/login');
    } catch (error) {
      // Error is caught and toasted in the useAuth hook
    } finally {
        setEmailLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // The redirect will be handled by the useEffect or signInWithGoogle function
    } catch (error) {
       // Error is caught and toasted in the useAuth hook
    } finally {
       setGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background/80 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Get started with your academic companion.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={emailLoading || googleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNo">Registration Number</Label>
                <Input
                  id="regNo"
                  type="text"
                  placeholder="19YYDDRRR"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  disabled={emailLoading || googleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={emailLoading || googleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@saveetha.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={emailLoading || googleLoading}
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  disabled={emailLoading || googleLoading}
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
              </div>
              <Button type="submit" className="w-full" disabled={emailLoading || googleLoading}>
                {emailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Sign Up
              </Button>
            </form>
            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-muted" />
              <span className="mx-4 text-xs uppercase text-muted-foreground">Or</span>
              <div className="flex-grow border-t border-muted" />
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={emailLoading || googleLoading}>
              {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 114.6 280.1 103 248 103c-73.2 0-133.1 60.3-133.1 134.9s59.9 134.9 133.1 134.9c79.2 0 111.3-52.1 115.8-77.9H248v-65.4h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
              }
              Sign up with Google
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="fixed bottom-6 right-6">
        <LoginIssueDialog />
      </div>
    </>
  );
}
