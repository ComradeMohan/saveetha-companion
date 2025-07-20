
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
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
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'madiremohanreddy0400.sse@saveetha.com';

interface UserProfileData {
  name: string;
  regNo: string;
  phone: string;
  email: string;
}

interface SignUpProfile extends UserProfileData {
  password?: string;
}
interface CompleteUserProfile {
  regNo: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmailAndPassword: (profile: SignUpProfile) => Promise<any>;
  loginWithEmailAndPassword: (email:string, password:string) => Promise<any>;
  completeUserProfile: (profile: CompleteUserProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const handleAuthError = (error: any, toast: (options: any) => void) => {
    console.error("Firebase Auth Error:", error.code, error.message);
    let title = 'Authentication Error';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
             title = 'Invalid Credentials';
             description = 'The email or password you entered is incorrect. Please try again.';
            break;
        case 'auth/email-already-in-use':
            title = 'Account Exists';
            description = 'An account with this email address already exists.';
            break;
        case 'auth/weak-password':
            title = 'Weak Password';
            description = 'The password must be at least 6 characters long.';
            break;
        case 'auth/invalid-email':
            title = 'Invalid Email';
            description = 'Please enter a valid email address.';
            break;
        case 'auth/network-request-failed':
            title = 'Network Error';
            description = 'Please check your internet connection and try again.';
            break;
        case 'auth/popup-closed-by-user':
             title = "Login Canceled";
             description = "You closed the sign-in window. Please try again.";
            break;
        case 'auth/operation-not-supported-in-this-environment':
            title = "Login Error";
            description = "Please use your @saveetha.com Google account to sign in.";
            break;
        default:
            // Keep the generic message for other errors
            break;
    }
    
    toast({ title, description, variant: 'destructive' });
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified && (user.metadata.creationTime !== user.metadata.lastSignInTime)) {
            toast({
                title: "Verification Required",
                description: "Please verify your email address to log in.",
                variant: 'destructive'
            });
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        setIsAdmin(user.email === ADMIN_EMAIL);

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          if (!user.displayName && userDoc.data()?.name) {
            await updateProfile(user, { displayName: userDoc.data()?.name });
          }
          setUser({ ...user });
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
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
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName,
          createdAt: new Date().toISOString(),
        });
        router.push('/complete-profile');
      } else {
        router.push('/');
      }

    } catch (error: any) {
        handleAuthError(error, toast);
        throw error;
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
        });
        
        await sendEmailVerification(user, {
          url: `${window.location.origin}/login`,
        });

        await signOut(auth);
        return userCredential;
    } catch (error: any) {
        handleAuthError(error, toast);
        throw error;
    }
  }
  
  const completeUserProfile = async (profile: CompleteUserProfile) => {
      if (!auth.currentUser) throw new Error("No user is signed in.");
      
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        regNo: profile.regNo,
        phone: profile.phone,
      }, { merge: true });

      if (!user.displayName) {
         const userDoc = await getDoc(userDocRef);
         const name = userDoc.data()?.name || "New User";
         await updateProfile(user, { displayName: name });
      }
      
      setUser({ ...user });
  }

  const loginWithEmailAndPassword = async (email:string, password:string) => {
     try {
        if (!email.endsWith('@saveetha.com')) {
          throw new Error('Please use an email ending with @saveetha.com');
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            toast({
                title: 'Email Not Verified',
                description: 'Please verify your email before logging in. A new verification link has been sent.',
                variant: 'destructive'
            });
            await sendEmailVerification(userCredential.user);
            await signOut(auth);
            throw new Error("Email not verified");
        }
        return userCredential;
     } catch(error: any) {
         if (error.message.includes('@saveetha.com')) {
              toast({ title: 'Invalid Email', description: error.message, variant: 'destructive' });
         } else {
             handleAuthError(error, toast);
         }
         throw error;
     }
  }

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    completeUserProfile,
    logout,
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
