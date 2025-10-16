'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
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
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'madiremohanreddy0400.sse@saveetha.com';

export interface UserProfileData {
  name: string;
  email: string;
  regNo?: string;
  phone?: string;
  isVerified: boolean;
  photoURL?: string;
  department?: string;
  college?: 'SSE' | 'SEC';
  credits?: number;
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
        
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
              const dbProfile = userDoc.data() as UserProfileData;
              let updatedProfile = { ...dbProfile };
              let creditsUpdated = false;

              // Check if credits need to be added for an existing user
              if (typeof dbProfile.credits === 'undefined') {
                updatedProfile.credits = 50; // Award 50 credits to existing users
                await updateDoc(userDocRef, { credits: 50 });
                await createNotification(
                    user.uid,
                    "You've been awarded 50 credits to use for the course enrollment auto-checker.",
                    "credit"
                );
                creditsUpdated = true;
              }
              
              setIsAdmin(dbProfile.email === ADMIN_EMAIL && dbProfile.isVerified);
              
              const updateData: any = {
                  lastSignInTime: user.metadata.lastSignInTime,
              };
              if (user.photoURL) {
                  updateData.photoURL = user.photoURL;
              }
              await updateDoc(userDocRef, updateData);

              setProfile({ ...updatedProfile, ...updateData });
              
              if (user.displayName && !dbProfile.name) {
                await updateDoc(userDocRef, { name: user.displayName });
              } else if (!user.displayName && dbProfile.name) {
                await updateProfile(user, { displayName: dbProfile.name });
              }

          } else {
             // This case handles a new user signup
             const newProfile: UserProfileData = {
                email: user.email!,
                name: user.displayName!,
                isVerified: true, // Automatically verified
                photoURL: user.photoURL || undefined,
                credits: 100, // Award 100 credits to new users
             };
             await setDoc(userDocRef, {
                ...newProfile,
                createdAt: new Date().toISOString(),
                lastSignInTime: user.metadata.lastSignInTime,
             });
             setProfile(newProfile);
          }
          const refreshedUser = { ...auth.currentUser } as User;
          setUser(refreshedUser);
        } catch(error){
          console.error("Error updating user document:", error);
          setUser(user);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      'hd': 'saveetha.com'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newProfile: UserProfileData = {
          email: user.email!,
          name: user.displayName!,
          isVerified: true, // Automatically verified on signup
          photoURL: user.photoURL || undefined,
          credits: 100, // Award 100 credits to new users
        };
        await setDoc(userDocRef, {
            ...newProfile,
            createdAt: new Date().toISOString(),
            lastSignInTime: user.metadata.lastSignInTime,
        });
        setProfile(newProfile);
        router.push('/complete-profile');
      } else {
        const dbProfile = userDoc.data() as UserProfileData;
        setProfile(dbProfile);
        if(!dbProfile.regNo) {
            router.push('/complete-profile');
        } else {
            router.push('/');
        }
      }

    } catch (error: any) {
      const message = handleAuthError(error, toast);
      throw new Error(message);
    }
  };
  
  const completeUserProfile = async (profile: CompleteUserProfile) => {
      if (!auth.currentUser) throw new Error("No user is signed in.");
      setIsNavigating(true);
      
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        regNo: profile.regNo,
        phone: profile.phone,
      }, { merge: true });
      
      const refreshedUser = { ...auth.currentUser } as User;
      setUser(refreshedUser);
      
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
        // Optimistically update local profile state
        setProfile(prev => prev ? { ...prev, ...data } : null);
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

  // The main loading logic is now simplified. The skeleton shows up via layout.tsx suspense.
  // The page loader only shows during explicit navigation events.
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
