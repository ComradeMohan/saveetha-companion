
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Play, StopCircle, Bell, RefreshCw, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';

export default function CourseEnrollmentPage() {
  const { profile } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [slot, setSlot] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [email, setEmail] = useState('');
  const [checkInterval, setCheckInterval] = useState('10');
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Waiting...');
  const [showStatus, setShowStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const { toast } = useToast();
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = "https://coursenotification.onrender.com/api";

  const slots = Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));

  // Function to check and restore session from localStorage
  useEffect(() => {
    const savedSessionId = localStorage.getItem('courseEnrollmentSessionId');
    const savedDetails = localStorage.getItem('courseEnrollmentDetails');
    if (savedSessionId && savedDetails) {
        const details = JSON.parse(savedDetails);
        setUsername(details.username);
        setSlot(details.slot);
        setCourseCode(details.courseCode);
        setEmail(details.email);
        setCheckInterval(details.checkInterval);
        
        setSessionId(savedSessionId);
        setShowStatus(true);
        setStatusText("Restored session. Checking status...");
        checkStatus(savedSessionId); // Initial check
        statusTimerRef.current = setInterval(() => checkStatus(savedSessionId), 5000);
    }
  }, []);

  const startMonitoring = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { username, password, slot, courseCode, email, checkInterval };

    if (Object.values(payload).some(val => val === '')) {
        toast({ title: "Missing fields", description: "Please fill out all fields before starting.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/start-checking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.session_id) {
            // Save session to localStorage
            localStorage.setItem('courseEnrollmentSessionId', data.session_id);
            localStorage.setItem('courseEnrollmentDetails', JSON.stringify({ username, slot, courseCode, email, checkInterval }));

            setSessionId(data.session_id);
            setShowStatus(true);
            setStatusText("Started monitoring...");
            setIsFinished(false);
            statusTimerRef.current = setInterval(() => checkStatus(data.session_id), 5000);
            toast({ title: "Monitoring Started", description: "The system is now checking for your course." });
        } else {
            throw new Error(data.message || 'Failed to start session.');
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not start monitoring.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const checkStatus = async (sId: string) => {
      if (!sId) return;
      try {
          const res = await fetch(`${API_BASE}/check-status/${sId}`);
          const data = await res.json();
          setStatusText(`Status: ${data.status}\n${data.message || ''}\nAttempts: ${data.attempts}`);

          if (data.status === "found" || data.status === "error") {
              if (statusTimerRef.current) {
                clearInterval(statusTimerRef.current);
                statusTimerRef.current = null;
              }
              setIsFinished(true); 
          }
      } catch (error) {
          console.error("Status check failed", error);
          setStatusText("Status check failed. Please check your connection.");
           if (statusTimerRef.current) {
                clearInterval(statusTimerRef.current);
                statusTimerRef.current = null;
            }
            setIsFinished(true);
      }
  };

  const stopAndReset = async () => {
      // Always clear the timer first
      if (statusTimerRef.current) {
          clearInterval(statusTimerRef.current);
          statusTimerRef.current = null;
      }
      
      // If there's a session ID, tell the server to stop
      if (sessionId) {
          try {
            await fetch(`${API_BASE}/stop-checking/${sessionId}`, { method: "POST" });
          } catch (error) {
            console.error("Failed to cleanly stop session on server", error);
          }
      }
      
      // Clear from localStorage
      localStorage.removeItem('courseEnrollmentSessionId');
      localStorage.removeItem('courseEnrollmentDetails');
      
      // Now, reset the entire UI state
      toast({ title: "Session Cleared", description: "Monitoring has been stopped and reset." });
      setStatusText("Waiting...");
      setSessionId(null);
      setShowStatus(false);
      setIsFinished(false);
  };
  
  useEffect(() => {
    // Cleanup on component unmount
    return () => {
        if(statusTimerRef.current) {
            clearInterval(statusTimerRef.current);
        }
    }
  }, []);

  return (
     <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Course Enrollment Alert System</h2>
                    <p className="text-muted-foreground mt-2">
                    Get an email notification the moment your desired course slot becomes available on ARMS.
                    </p>
                </div>
                <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-6 w-6 text-primary" /> Enrollment Notifier
                            </CardTitle>
                            {profile && (
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                                    <Star className="h-4 w-4 text-primary" />
                                    <span>{profile.credits ?? 0} Credits</span>
                                </div>
                            )}
                        </div>
                        <CardDescription>Enter your ARMS details and course info below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="courseForm" onSubmit={startMonitoring} className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Important Security Notice</AlertTitle>
                                <AlertDescription>
                                    Your ARMS credentials are required for this service but are used temporarily and are not stored. Use at your own discretion.
                                </AlertDescription>
                            </Alert>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="username">ARMS Username</Label>
                                    <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g., 2115XXXX" required disabled={!!sessionId} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="password">ARMS Password</Label>
                                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={!!sessionId} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="slot">Slot</Label>
                                    <Select onValueChange={setSlot} value={slot} disabled={!!sessionId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {slots.map(s => <SelectItem key={s} value={s}>{`Slot ${s}`}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="courseCode">Course Code</Label>
                                    <Input id="courseCode" value={courseCode} onChange={e => setCourseCode(e.target.value.toUpperCase())} placeholder="e.g., CSE101" required disabled={!!sessionId}/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Notification Email</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your-email@example.com" required disabled={!!sessionId}/>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="checkInterval">Check Interval (seconds)</Label>
                                <Input id="checkInterval" type="number" value={checkInterval} onChange={e => setCheckInterval(e.target.value)} placeholder="10" disabled={!!sessionId}/>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        {!sessionId ? (
                            <Button type="submit" form="courseForm" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Play className="mr-2 h-4 w-4" />}
                                Start Monitoring
                            </Button>
                        ) : !isFinished ? (
                             <Button onClick={stopAndReset} variant="destructive" className="w-full">
                                <StopCircle className="mr-2 h-4 w-4"/>
                                Stop Monitoring
                            </Button>
                        ) : (
                             <Button onClick={stopAndReset} variant="outline" className="w-full">
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                Clear and Restart
                            </Button>
                        )}
                        {showStatus && (
                            <div className="w-full p-4 bg-muted rounded-lg text-center animate-in fade-in-50">
                                <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{statusText}</pre>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
         </div>
      </main>
      <Footer />
    </div>
  );
}
