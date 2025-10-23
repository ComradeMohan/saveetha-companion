
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db, messaging } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getToken } from 'firebase/messaging';

const ADMIN_EMAIL = 'madiremohanreddy0400.sse@saveetha.com';
const ALLOWED_TEST_EMAIL = 'k.nobitha666@gmail.com';


export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  regNo?: string;
  phone?: string;
  isVerified: boolean;
  photoURL?: string;
  department?: string;
  college?: 'SSE' | 'SEC';
  credits?: number;
  recruitmentInterestSubmitted?: boolean;
}

interface CompleteUserProfile {
  regNo: string;
  phone: string;
}
interface AcademicProfile {
    department: string;
    college: 'SSE' | 'SEC';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  isAdmin: boolean;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  signInWithGoogle: (isSignUp?: boolean) => Promise<void>;
  completeUserProfile: (profile: CompleteUserProfile) => Promise<void>;
  updateUserAcademicProfile: (data: AcademicProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const handleAuthError = (error: any, toast: (options: any) => void): string => {
    console.error("Firebase Auth Error:", error.code, error.message);
    let title = 'Authentication Error';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
             description = 'The email or password you entered is incorrect.';
            break;
        case 'auth/email-already-in-use':
            description = 'An account with this email address already exists.';
            break;
        case 'auth/weak-password':
            description = 'The password must be at least 6 characters long.';
            break;
        case 'auth/invalid-email':
            description = 'Please enter a valid email address.';
            break;
        case 'auth/network-request-failed':
            title = 'Network Error';
            description = 'Could not connect to the server. Please check your internet connection.';
            toast({ title, description, variant: 'destructive' });
            break;
        case 'auth/popup-closed-by-user':
             description = "The sign-in window was closed before completing. Please try again.";
            break;
        case 'auth/operation-not-supported-in-this-environment':
            title = "Login Error";
            description = "Please use your @saveetha.com Google account to sign in.";
            toast({ title, description, variant: 'destructive' });
            break;
        case 'auth/too-many-requests':
            title = 'Too Many Attempts';
            description = 'Access to this account is temporarily disabled due to many failed attempts.';
            toast({ title, description, variant: 'destructive' });
            break;
    }
    
    return description;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // End navigation loading when path changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const createNotification = async (userId: string, message: string, type: 'credit' | 'default') => {
    const notifsRef = collection(db, 'user_notifications', userId, 'notifications');
    await addDoc(notifsRef, {
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Use onSnapshot for real-time profile updates
        const unsubProfile = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
                const dbProfile = userDoc.data() as UserProfileData;
                let updatedProfile = { ...dbProfile, uid: user.uid };

                if (typeof dbProfile.credits === 'undefined') {
                    updatedProfile.credits = 50; 
                    await updateDoc(userDocRef, { credits: 50 });
                    await createNotification(
                        user.uid,
                        "You've been awarded 50 credits to use for the course enrollment auto-checker!",
                        "credit"
                    );
                }
                
                setIsAdmin(dbProfile.email === ADMIN_EMAIL && dbProfile.isVerified);
                
                const updateData: any = {
                    lastSignInTime: user.metadata.lastSignInTime,
                };
                if (user.photoURL && user.photoURL !== dbProfile.photoURL) {
                    updateData.photoURL = user.photoURL;
                }
                await updateDoc(userDocRef, updateData);

                const finalProfile = { ...updatedProfile, ...updateData };
                setProfile(finalProfile);

                const isProfileIncomplete = !finalProfile.regNo || !finalProfile.phone;
                if (isProfileIncomplete && pathname !== '/complete-profile') {
                    router.push('/complete-profile');
                }
                
                if (user.displayName && !dbProfile.name) {
                    await updateDoc(userDocRef, { name: user.displayName });
                } else if (!user.displayName && dbProfile.name) {
                    await updateProfile(user, { displayName: dbProfile.name });
                }
                
            } else {
               const newProfileData: UserProfileData = {
                  uid: user.uid,
                  email: user.email!,
                  name: user.displayName!,
                  isVerified: true,
                  photoURL: user.photoURL || undefined,
                  credits: 100, 
               };
               await setDoc(userDocRef, {
                  ...newProfileData,
                  createdAt: new Date().toISOString(),
                  lastSignInTime: user.metadata.lastSignInTime,
               });
               await createNotification(
                  user.uid,
                  "Welcome! You've received 100 credits to get started with our premium features.",
                  "credit"
               );
               setProfile(newProfileData);
               if (pathname !== '/complete-profile') {
                  router.push('/complete-profile');
               }
            }
            const refreshedUser = { ...auth.currentUser } as User;
            setUser(refreshedUser);
            setLoading(false);
        }, (error) => {
            console.error("Error with profile snapshot:", error);
            setUser(user);
            setLoading(false);
        });

        return unsubProfile;

      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router, toast]);

  const signInWithGoogle = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user.email && !user.email.endsWith('@saveetha.com') && user.email !== ALLOWED_TEST_EMAIL) {
         await signOut(auth); // Sign out the user immediately
         toast({
              title: 'Invalid Email Domain',
              description: 'Only @saveetha.com Google accounts are allowed.',
              variant: 'destructive',
          });
          throw new Error('Invalid email domain');
      }
      // The onAuthStateChanged listener will handle the rest of the logic.
    } catch (error: any) {
        const message = handleAuthError(error, toast);
        throw new Error(message);
    }
  };
  
  const completeUserProfile = async (profileData: CompleteUserProfile) => {
      if (!auth.currentUser) throw new Error("No user is signed in.");
      setIsNavigating(true);
      
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        regNo: profileData.regNo,
        phone: profileData.phone,
      }, { merge: true });
      
      // No need to setProfile here, onSnapshot will handle it.
      
      toast({
        title: 'Profile Complete!',
        description: "You're all set! Welcome to the Saveetha Companion.",
      });

      router.push('/');
  }

  const updateUserAcademicProfile = async (data: AcademicProfile) => {
    if (!auth.currentUser) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
        return;
    }
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
        await updateDoc(userDocRef, {
            department: data.department,
            college: data.college
        });
        // No need to setProfile here, onSnapshot will handle it.
        toast({ title: 'Success!', description: 'Your profile has been updated.' });
    } catch (error) {
        console.error("Error updating academic profile:", error);
        toast({ title: 'Error', description: 'Could not update your profile.', variant: 'destructive' });
        throw error;
    }
  }

  const logout = async () => {
    setIsNavigating(true);
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isNavigating,
    setIsNavigating,
    signInWithGoogle,
    completeUserProfile,
    updateUserAcademicProfile,
    logout,
  };

  function PageLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {isNavigating && <PageLoader />}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
