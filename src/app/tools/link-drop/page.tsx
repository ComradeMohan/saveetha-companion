'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon, Loader2, Sparkles, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, getDoc, setDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/header';
import Footer from '@/components/footer';

// Generate a random 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export default function LinkDropPage() {
    const { toast } = useToast();
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [sharedContent, setSharedContent] = useState('');
    const [isCreator, setIsCreator] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const unsubscribeRef = useRef<() => void | null>(null);

    // Debounce function to prevent rapid Firestore writes
    const debounce = (func: (...args: any[]) => void, delay: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const updateFirestoreContent = useCallback(debounce(async (code: string, content: string) => {
        if (!code) return;
        const sessionRef = doc(db, 'link-drop-sessions', code);
        await updateDoc(sessionRef, { content, lastUpdatedAt: serverTimestamp() });
    }, 500), []);


    useEffect(() => {
        if (sessionCode && sessionActive) {
            updateFirestoreContent(sessionCode, sharedContent);
        }
    }, [sharedContent, sessionCode, sessionActive, updateFirestoreContent]);


    const createSession = async () => {
        setIsLoading(true);
        try {
            let newCode = generateCode();
            let attempts = 0;
            // Retry if the code already exists (highly unlikely, but good practice)
            while (attempts < 5) {
                const sessionRef = doc(db, 'link-drop-sessions', newCode);
                const docSnap = await getDoc(sessionRef);
                if (!docSnap.exists()) {
                    break;
                }
                newCode = generateCode();
                attempts++;
            }
            
            await setDoc(doc(db, 'link-drop-sessions', newCode), {
                content: '',
                createdAt: serverTimestamp(),
                lastUpdatedAt: serverTimestamp(),
            });

            setSessionCode(newCode);
            setIsCreator(true);
            setSessionActive(true);
            subscribeToSession(newCode);
            toast({ title: "Session created!", description: `Share the code: ${newCode}`});
        } catch (error) {
            console.error("Error creating session:", error);
            toast({ title: 'Error', description: 'Could not create a session. Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const joinSession = async () => {
        if (!joinCode || joinCode.length !== 6) {
            toast({ title: 'Invalid Code', description: 'Please enter a valid 6-digit code.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            const sessionRef = doc(db, 'link-drop-sessions', joinCode);
            const docSnap = await getDoc(sessionRef);

            if (docSnap.exists()) {
                setSessionCode(joinCode);
                setIsCreator(false);
                setSessionActive(true);
                subscribeToSession(joinCode);
                toast({ title: 'Joined!', description: `You are now connected to session ${joinCode}.` });
            } else {
                toast({ title: 'Session Not Found', description: 'No active session found for that code.', variant: 'destructive' });
            }
        } catch (error) {
            console.error("Error joining session:", error);
            toast({ title: 'Error', description: 'Could not join the session.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeToSession = (code: string) => {
        const sessionRef = doc(db, 'link-drop-sessions', code);
        const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSharedContent(data.content);
            } else {
                // The document was likely deleted (e.g., by TTL policy)
                endSession();
                toast({ title: 'Session Ended', description: 'The sharing session has been closed.', variant: 'destructive'});
            }
        });
        unsubscribeRef.current = unsubscribe;
    };
    
    const endSession = () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        setSessionCode(null);
        setJoinCode('');
        setSharedContent('');
        setSessionActive(false);
        setIsCreator(false);
    };

    // Cleanup subscription on unmount
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4">
                    <Card className="max-w-2xl mx-auto shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <LinkIcon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Link Drop</CardTitle>
                            <CardDescription>
                                {sessionActive 
                                    ? "Your real-time clipboard is active."
                                    : "Instantly share links and text between your devices."
                                }
                            </CardDescription>
                        </CardHeader>

                        {!sessionActive ? (
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                <div className="flex flex-col items-center justify-center gap-3 text-center p-6 border rounded-lg">
                                    <Sparkles className="h-8 w-8 text-primary"/>
                                    <h3 className="font-semibold">Create a New Session</h3>
                                    <p className="text-sm text-muted-foreground">Start a new sharing room and get a unique code.</p>
                                    <Button onClick={createSession} disabled={isLoading} className="mt-2">
                                        {isLoading && isCreator ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Create Room
                                    </Button>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-3 text-center p-6 border rounded-lg">
                                    <Users className="h-8 w-8 text-primary"/>
                                    <h3 className="font-semibold">Join a Session</h3>
                                    <p className="text-sm text-muted-foreground">Enter a 6-digit code from another device.</p>
                                    <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
                                        <Input 
                                            type="text" 
                                            placeholder="123456" 
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                            maxLength={6}
                                        />
                                        <Button onClick={joinSession} disabled={isLoading}>
                                            {isLoading && !isCreator ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                            Join
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <>
                            <CardContent>
                                <div className="text-center mb-4">
                                    <p className="text-sm text-muted-foreground">Session Code:</p>
                                    <p className="text-2xl font-bold tracking-widest font-mono text-primary">{sessionCode}</p>
                                </div>
                                <textarea
                                    value={sharedContent}
                                    onChange={(e) => setSharedContent(e.target.value)}
                                    placeholder="Paste a link or type anything here..."
                                    className="w-full min-h-[200px] p-3 border rounded-md bg-secondary/50 focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                />
                            </CardContent>
                            <CardFooter>
                                <Button variant="destructive" onClick={endSession}>End Session</Button>
                            </CardFooter>
                            </>
                        )}
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}