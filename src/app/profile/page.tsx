
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Mail, Hash, Phone } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface UserProfile {
  name: string;
  email: string;
  regNo: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
                name: data.name || user.displayName || 'N/A',
                email: data.email || user.email || 'N/A',
                regNo: data.regNo || 'N/A',
                phone: data.phone || 'N/A',
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
        fetchProfile();
    }
  }, [user, authLoading]);

  const userInitials = profile?.name ? profile.name.slice(0, 2).toUpperCase() : '?';

  return (
    <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-20">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Your Profile</CardTitle>
                        <CardDescription>View your personal information below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading || authLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : profile ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user?.photoURL ?? ''} alt={profile.name} />
                                        <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                                        <p className="text-muted-foreground">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                        <Hash className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">Registration No.</p>
                                            <p className="text-muted-foreground">{profile.regNo}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                        <Phone className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">Phone Number</p>
                                            <p className="text-muted-foreground">{profile.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">Could not load profile information.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
