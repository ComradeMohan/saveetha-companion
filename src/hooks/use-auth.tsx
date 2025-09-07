
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
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
}


interface SignUpProfile extends UserProfileData {
  password?: string;
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
  signUpWithEmailAndPassword: (profile: SignUpProfile) => Promise<any>;
  loginWithEmailAndPassword: (email:string, password:string) => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAdmin(user.email === ADMIN_EMAIL && user.emailVerified);
        const userDocRef = doc(db, 'users', user.uid);
        
        try {
          const userDoc = await getDoc(userDocRef);
          const updateData: any = {
              lastSignInTime: user.metadata.lastSignInTime,
              isVerified: user.emailVerified,
          };
          if (user.photoURL) {
              updateData.photoURL = user.photoURL;
          }

          if (userDoc.exists()) {
              await updateDoc(userDocRef, updateData);
              const dbProfile = userDoc.data() as UserProfileData;
              setProfile(dbProfile);
              if (!user.displayName && dbProfile?.name) {
                await updateProfile(user, { displayName: dbProfile.name });
              }
          }
          // Refresh user object to get latest profile info
          const refreshedUser = { ...auth.currentUser } as User;
          setUser(refreshedUser);
        } catch(error){
          console.error("Error updating user document:", error);
          // Still set the user, as they are authenticated.
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
          isVerified: user.emailVerified,
          photoURL: user.photoURL || undefined,
        };
        await setDoc(userDocRef, {
            ...newProfile,
            createdAt: new Date().toISOString(),
            lastSignInTime: user.metadata.lastSignInTime,
        });
        setProfile(newProfile);
        
        if (!isSignUp) {
            router.push('/complete-profile');
        }
        // If it is a sign-up, the useEffect on the signup page will handle the redirect to step 2.
      } else {
        setProfile(userDoc.data() as UserProfileData);
        if (!isSignUp) {
            router.push('/');
        }
        // If it is a sign-up, but the user exists, the useEffect on the signup page will take them to step 2 anyway.
      }

    } catch (error: any) {
      const message = handleAuthError(error, toast);
      throw new Error(message);
    }
  };
  
  const signUpWithEmailAndPassword = async (profile: SignUpProfile) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, profile.email, profile.password!);
        const user = userCredential.user;
        
        await updateProfile(user, {
            displayName: profile.name,
        });
        
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            name: profile.name,
            email: profile.email,
            regNo: profile.regNo,
            phone: profile.phone,
            createdAt: new Date().toISOString(),
            isVerified: false,
        });
        
        await sendEmailVerification(user, {
          url: `${window.location.origin}/login`,
        });

        await signOut(auth); // Sign out user after registration to force verification
        return userCredential;
    } catch (error: any) {
        const message = handleAuthError(error, toast);
        throw new Error(message);
    }
  }
  
  const completeUserProfile = async (profile: CompleteUserProfile) => {
      if (!auth.currentUser) throw new Error("No user is signed in.");
      setIsNavigating(true);
      
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        regNo: profile.regNo,
        phone: profile.phone,
      }, { merge: true });

      // If user has no display name (e.g. they signed up with google but never had one),
      // we need to refetch their name from the DB and set it.
      if (!user.displayName) {
         const userDoc = await getDoc(userDocRef);
         const name = userDoc.data()?.name || "New User";
         await updateProfile(user, { displayName: name });
      }
      
      // Manually update the user state to reflect completion and trigger redirect effect
      const refreshedUser = { ...auth.currentUser } as User;
      setUser(refreshedUser);
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

  const loginWithEmailAndPassword = async (email:string, password:string) => {
     try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
             toast({ 
                title: 'Verification Recommended',
                description: "Please check your email (and spam folder) to verify your account.",
             });
        }
        return userCredential;
     } catch(error: any) {
        const message = handleAuthError(error, toast);
        throw new Error(message);
     }
  }

  const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: 'Password Reset Email Sent',
            description: 'Check your inbox (and spam folder) for a link to reset your password.',
        });
    } catch (error: any) {
        // Modify the error handler to be more specific for this case
        if (error.code === 'auth/user-not-found') {
            toast({
                title: 'User Not Found',
                description: 'No account was found with this email address.',
                variant: 'destructive',
            });
        } else {
            handleAuthError(error, toast);
        }
        throw error;
    }
  };

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
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    sendPasswordReset,
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

  if (loading) {
    // The Suspense fallback in layout.tsx will handle the initial skeleton UI
    return null;
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
