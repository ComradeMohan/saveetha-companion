
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck } from 'lucide-react';

export default function CompleteProfilePage() {
  const [regNo, setRegNo] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, completeUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Error', description: 'You are not signed in.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      await completeUserProfile({
        regNo,
        phone,
      });
      router.push('/');
      toast({ title: 'Profile completed successfully!' });
    } catch (error) {
      console.error('Profile Completion Error:', error);
      toast({ title: 'Error completing profile', description: (error as Error).message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">One Last Step</CardTitle>
          <CardDescription>Please provide a few more details to complete your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regNo">Registration Number</Label>
              <Input
                id="regNo"
                type="text"
                placeholder="e.g. 2115XXXX"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
              Complete Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
