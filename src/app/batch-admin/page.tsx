'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Gift, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getReferralCount } from '@/app/actions/get-referral-count';
import { Skeleton } from '@/components/ui/skeleton';

export default function BatchAdminDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [referralLink, setReferralLink] = useState('');
    const [referralCount, setReferralCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const link = `${window.location.origin}/signup?ref=${user.uid}`;
            setReferralLink(link);

            const fetchCount = async () => {
                setLoading(true);
                const count = await getReferralCount(user.uid);
                setReferralCount(count);
                setLoading(false);
            }
            fetchCount();
        }
    }, [user]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            toast({
                title: 'Copied!',
                description: 'Your referral link has been copied to the clipboard.',
            });
        }, (err) => {
            toast({
                title: 'Error',
                description: 'Could not copy the link.',
                variant: 'destructive',
            });
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Referral Dashboard</h2>
                <p className="text-muted-foreground">Track your referrals and share your link to invite new users.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-12 w-24" />
                        ) : (
                            <p className="text-4xl font-bold">{referralCount}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Total users registered via your link.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gift /> Rewards</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <p className="text-4xl font-bold">Coming Soon</p>
                        <p className="text-sm text-muted-foreground">Rewards for top referrers will be announced.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Unique Referral Link</CardTitle>
                    <CardDescription>Share this link with other students to invite them to the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Input value={referralLink} readOnly />
                        <Button onClick={copyToClipboard} size="icon">
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
