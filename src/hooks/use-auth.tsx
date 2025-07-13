
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
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';

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
  signInWithGoogle: () => Promise<void>;
  signUpWithEmailAndPassword: (profile: SignUpProfile) => Promise<any>;
  loginWithEmailAndPassword: (email:string, password:string) => Promise<any>;
  completeUserProfile: (profile: CompleteUserProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user profile is complete in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
           // If displayName is not on auth object, update it
          if (!user.displayName && userDoc.data()?.name) {
            await updateProfile(user, { displayName: userDoc.data()?.name });
          }
          setUser({ ...user }); // Trigger re-render with updated user
        } else {
          // New Google sign-in user, needs to complete profile
          setUser(user); // Keep user object but it's incomplete
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        // New user, create partial profile, will be completed later
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName,
        });
        router.push('/complete-profile');
      } else {
        router.push('/');
      }

    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
             toast({
                title: "Login Canceled",
                description: "You closed the sign-in window. Please try again.",
                variant: "destructive"
            });
        }
        else if (error.code === 'auth/operation-not-supported-in-this-environment' || error.message.includes('hd parameter')) {
            toast({
                title: "Login Error",
                description: "Please use your @saveetha.com Google account to sign in.",
                variant: "destructive"
            });
        } else {
             toast({
                title: "Login Error",
                description: error.message,
                variant: "destructive"
            });
        }
        throw error;
    }
  };
  
  const signUpWithEmailAndPassword = async (profile: SignUpProfile) => {
    const userCredential = await createUserWithEmailAndPassword(auth, profile.email, profile.password!);
    const user = userCredential.user;
    
    await updateProfile(user, {
        displayName: profile.name,
    });
    
    // Store user info in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        name: profile.name,
        email: profile.email,
        regNo: profile.regNo,
        phone: profile.phone
    });

    setUser(user);
    return userCredential;
  }
  
  const completeUserProfile = async (profile: CompleteUserProfile) => {
      if (!auth.currentUser) throw new Error("No user is signed in.");
      
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      
      // Update Firestore document with new details
      await setDoc(userDocRef, {
        regNo: profile.regNo,
        phone: profile.phone,
      }, { merge: true });

      // If user has no displayName (e.g., from initial Google sign up), set it.
      if (!user.displayName) {
        // This is a bit of a placeholder, ideally name is captured on a form
        // but for now we mark it to signify completion.
         const userDoc = await getDoc(userDocRef);
         const name = userDoc.data()?.name || "New User";
         await updateProfile(user, { displayName: name });
      }
      
      // Manually update the user state to reflect the change immediately
      setUser({ ...user });
  }

  const loginWithEmailAndPassword = (email:string, password:string) => {
    if (!email.endsWith('@saveetha.com')) {
      throw new Error('Please use an email ending with @saveetha.com');
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
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
