
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Link from 'next/link';
import { LoginIssueDialog } from '@/components/login-issue-dialog';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

   React.useEffect(() => {
    const checkUserAndRedirect = async () => {
        if (!authLoading && user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const profile = userDoc.data();
                 if (!profile.regNo) {
                    router.push('/complete-profile');
                } else {
                    router.push('/');
                }
            } else {
                router.push('/complete-profile');
            }
        }
    };
    checkUserAndRedirect();
  }, [user, authLoading, router, toast]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // The redirect is handled by the useEffect
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
                <h2 className="text-5xl font-extrabold tracking-tight animate-text-gradient">Welcome Back, Future Leader!</h2>
                <p className="text-muted-foreground max-w-sm mt-4 text-lg">Sign in to access your dashboard, calculators, and exclusive resources.</p>
              </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription>Use your @saveetha.com Google account to sign in.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-66.5 64.6C305.5 114.6 280.1 103 248 103c-73.2 0-133.1 60.3-133.1 134.9s59.9 134.9 133.1 134.9c79.2 0 111.3-52.1 115.8-77.9H248v-65.4h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                      }
                      Sign in with Google
                  </Button>
                   {error && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive dark:text-red-400">
                          <AlertCircle className="h-4 w-4"/>
                          <p>{error}</p>
                      </div>
                  )}
                   <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:underline">
                      Sign up
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
