
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function HackathonsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Hackathons & Competitions</h2>
                        <p className="text-muted-foreground mt-2">
                            Discover upcoming hackathons, coding challenges, and innovation contests.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                            <CardDescription>
                                This section is under construction. We are currently curating a list of exciting events for you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-16 text-muted-foreground">
                            <Trophy className="mx-auto h-12 w-12" />
                            <p className="mt-4">Check back soon for a list of upcoming hackathons!</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
