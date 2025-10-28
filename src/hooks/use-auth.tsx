
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
  deleteUser,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, addDoc, writeBatch, getDocs, deleteDoc as deleteFirestoreDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { sendWelcomeEmail } from '@/app/actions/send-welcome-email';

const ADMIN_EMAIL = 'madiremohanreddy0400.sse@saveetha.com';
const BATCH_ADMIN_EMAILS = ['k.nobitha666@gmail.com'];


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
  profileLoading: boolean; // New state
  isAdmin: boolean;
  isBatchAdmin: boolean;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  signInWithGoogle: (isSignUp?: boolean) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  completeUserProfile: (profile: CompleteUserProfile) => Promise<void>;
  updateUserAcademicProfile: (data: AcademicProfile) => Promise<void>;
  logout: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
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
         case 'auth/requires-recent-login':
            title = 'Action Required';
            description = 'This is a sensitive action. Please sign in again before deleting your account.';
            toast({ title, description, variant: 'destructive' });
            break;
    }
    
    return description;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBatchAdmin, setIsBatchAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);
  
  const createNotification = useCallback(async (userId: string, message: string, type: 'credit' | 'default') => {
    const notifsRef = collection(db, 'user_notifications', userId, 'notifications');
    await addDoc(notifsRef, {
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setProfileLoading(true);

      if (user) {
        setUser(user);
        setIsAdmin(user.email === ADMIN_EMAIL);
        setIsBatchAdmin(BATCH_ADMIN_EMAILS.includes(user.email ?? ''));
        
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const dbProfile = userDoc.data() as UserProfileData;
            setProfile(dbProfile);
            const isProfileIncomplete = !dbProfile.regNo || !dbProfile.phone;
            if (isProfileIncomplete && pathname !== '/complete-profile' && pathname !== '/dev-login') {
                router.push('/complete-profile');
            }
          } else {
            // New user scenario
            const newProfileData: UserProfileData = {
              uid: user.uid,
              email: user.email!,
              name: user.displayName!,
              isVerified: true,
              photoURL: user.photoURL || undefined,
              credits: 100,
            };
            setDoc(userDocRef, { ...newProfileData, createdAt: new Date().toISOString(), lastSignInTime: user.metadata.lastSignInTime })
              .then(() => {
                setProfile(newProfileData);
                createNotification(user.uid, "Welcome! You've received 100 credits.", "credit");
                sendWelcomeEmail({ to: user.email!, name: user.displayName! });
                if (pathname !== '/complete-profile' && pathname !== '/dev-login') {
                    router.push('/complete-profile');
                }
            });
          }
          setProfileLoading(false);
        });

        setLoading(false);
        return () => unsubscribeProfile();

      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsBatchAdmin(false);
        setLoading(false);
        setProfileLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router, pathname, createNotification]);

  const signInWithGoogle = async (isSignUp = false) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account',
        'hd': 'saveetha.com' 
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
        const message = handleAuthError(error, toast);
        throw new Error(message);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (email !== ADMIN_EMAIL && !BATCH_ADMIN_EMAILS.includes(email)) {
      throw new Error("This login method is for authorized developers only.");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        toast({ title: 'Success!', description: 'Your profile has been updated.' });
    } catch (error) {
        console.error("Error updating academic profile:", error);
        toast({ title: 'Error', description: 'Could not update your profile.', variant: 'destructive' });
        throw error;
    }
  }

  const deleteUserAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("No user is currently signed in.");
    }
    try {
        const collectionsToDelete = [
            'students_cgpa',
            'student_grades',
            'user_notifications',
        ];
        const batch = writeBatch(db);

        for (const collectionName of collectionsToDelete) {
             batch.delete(doc(db, collectionName, currentUser.uid));
        }

        const programsRef = collection(db, 'users', currentUser.uid, 'savedPrograms');
        const programsSnap = await getDocs(programsRef);
        programsSnap.forEach(doc => batch.delete(doc.ref));
        
        batch.delete(doc(db, 'users', currentUser.uid));
        
        await batch.commit();

        await deleteUser(currentUser);
        
        toast({
            title: 'Account Deleted',
            description: 'Your account and all associated data have been permanently deleted.',
        });
    } catch (error: any) {
         const message = handleAuthError(error, toast);
         throw new Error(message);
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
    profileLoading,
    isAdmin,
    isBatchAdmin,
    isNavigating,
    setIsNavigating,
    signInWithGoogle,
    signInWithEmail,
    completeUserProfile,
    updateUserAcademicProfile,
    logout,
    deleteUserAccount,
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

// This is deprecated, use useAuth instead for profile access.
export function ProfileProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// This is deprecated, useAuth hook now provides the profile directly.
export const useProfile = (): UserProfileData | null => {
  const { profile } = useAuth();
  return profile;
};
