
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function InternshipsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Internships & Jobs</h2>
                        <p className="text-muted-foreground mt-2">
                            Find opportunities to kickstart your career.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                            <CardDescription>
                                This feature is currently in development. We are working on bringing you the latest job and internship postings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-16 text-muted-foreground">
                            <Briefcase className="mx-auto h-12 w-12" />
                            <p className="mt-4">Stay tuned for internship and job opportunities!</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
