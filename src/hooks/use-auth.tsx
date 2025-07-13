
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
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from './use-toast';

interface UserProfile {
  name: string;
  regNo: string;
  phone: string;
  email: string;
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
  signUpWithEmailAndPassword: (profile: UserProfile) => Promise<any>;
  loginWithEmailAndPassword: (email:string, password:string) => Promise<any>;
  completeUserProfile: (profile: CompleteUserProfile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      'hd': 'saveetha.com' // Restrict to a specific G Suite domain
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
        // Handle specific error for wrong domain
        if (error.code === 'auth/operation-not-supported-in-this-environment' || error.message.includes('hd parameter')) {
            toast({
                title: "Login Error",
                description: "Please use your @saveetha.com Google account.",
                variant: "destructive"
            });
        } else {
             toast({
                title: "Login Error",
                description: error.message,
                variant: "destructive"
            });
        }
        // Rethrow to be caught by the component
        throw error;
    }
  };
  
  const signUpWithEmailAndPassword = async (profile: UserProfile) => {
    const userCredential = await createUserWithEmailAndPassword(auth, profile.email, profile.password!);
    await updateProfile(userCredential.user, {
        displayName: profile.name,
        // We can't store custom fields like regNo and phone directly in the user profile object.
        // This would typically be stored in a Firestore/RTDB collection.
        // For this example, we'll just log it.
    });
    console.log("RegNo:", profile.regNo, "Phone:", profile.phone);
    return userCredential;
  }
  
  const completeUserProfile = async (profile: CompleteUserProfile) => {
      if (!auth.currentUser) throw new Error("No user is signed in.");
      
      // In a real app, you would save this to Firestore or Realtime Database
      // associated with the user's UID.
      console.log("Updating profile with:", profile);

      // We are using displayName to check if profile is complete.
      // We will set a dummy name here for now, but in real app, it would come from Google or sign up.
      // Since Google sign-in already provides displayName, this logic primarily serves to mark the profile as "complete" for our app's logic.
      const displayName = auth.currentUser.displayName || "New User";

      await updateProfile(auth.currentUser, {
          displayName: displayName
      });
      
      // Manually update the user state to reflect the change immediately
      setUser(auth.currentUser);
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
