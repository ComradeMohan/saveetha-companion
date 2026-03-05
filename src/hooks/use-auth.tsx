
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
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, addDoc, writeBatch, getDocs, deleteDoc as deleteFirestoreDoc, onSnapshot, runTransaction, increment } from 'firebase/firestore';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { sendWelcomeEmail } from '@/app/actions/send-welcome-email';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;


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
  feedbackSubmitted?: boolean;
  referredBy?: string;
  referralCount?: number;
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
  profileLoading: boolean; 
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
  console.error("Auth Error:", error.code, error.message);
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
    case 'auth/network-request-failed':
      description = 'Could not connect to the server. Please check your internet connection.';
      toast({ title: 'Network Error', description, variant: 'destructive' });
      break;
    case 'auth/popup-closed-by-user':
      description = "The sign-in window was closed before completing.";
      break;
  }

  return description;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const AUTH_CACHE_KEY = 'saveetha-auth-cache';

  const getCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error('Error reading auth cache', e);
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(() => getCachedUser());
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(() => !getCachedUser());
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
      if (user) {
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        };
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(serializableUser));

        setUser(user);
        setIsAdmin(user.email === ADMIN_EMAIL);

        const userDocRef = doc(db, 'users', user.uid);
        const batchAdminDocRef = doc(db, 'batchAdmins', user.uid);

        getDoc(batchAdminDocRef).then(snap => setIsBatchAdmin(snap.exists()));

        const unsubscribeProfile = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const dbProfile = userDoc.data() as UserProfileData;
            setProfile(dbProfile);
          } else {
            // New user initialization
            const referralId = new URLSearchParams(window.location.search).get('ref');
            const newProfileData: UserProfileData = {
              uid: user.uid,
              email: user.email!,
              name: user.displayName!,
              isVerified: true,
              photoURL: user.photoURL || undefined,
              credits: 100,
              referredBy: referralId || undefined,
            };
            setDoc(userDocRef, { ...newProfileData, createdAt: new Date().toISOString(), lastSignInTime: user.metadata.lastSignInTime })
              .then(async () => {
                if (referralId) {
                  const referrerAdminRef = doc(db, "batchAdmins", referralId);
                  runTransaction(db, async (transaction) => {
                    const referrerDoc = await transaction.get(referrerAdminRef);
                    if (referrerDoc.exists()) {
                      transaction.update(referrerAdminRef, { referralCount: increment(1) });
                    }
                  }).catch(e => console.error("Referral count update failed", e));
                }
                setProfile(newProfileData);
                createNotification(user.uid, "Welcome! You've received 100 credits.", "credit");
                sendWelcomeEmail({ to: user.email!, name: user.displayName! });
              });
          }
          setProfileLoading(false);
        });

        setLoading(false);
        return () => unsubscribeProfile();

      } else {
        localStorage.removeItem(AUTH_CACHE_KEY);
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsBatchAdmin(false);
        setLoading(false);
        setProfileLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [createNotification]);

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
    if (!auth.currentUser) return;
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
    if (!currentUser) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'students_cgpa', currentUser.uid));
      batch.delete(doc(db, 'student_grades', currentUser.uid));
      batch.delete(doc(db, 'user_notifications', currentUser.uid));
      batch.delete(doc(db, 'users', currentUser.uid));
      await batch.commit();
      await deleteUser(currentUser);
      toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
    } catch (error: any) {
      const message = handleAuthError(error, toast);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setIsNavigating(true);
    localStorage.removeItem(AUTH_CACHE_KEY);
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

  return (
    <AuthContext.Provider value={value}>
      {isNavigating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
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

export function ProfileProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
