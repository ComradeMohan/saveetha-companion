
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function PlacementPrepPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Placement Preparation</h2>
                        <p className="text-muted-foreground mt-2">
                            Resources and tools to help you ace your interviews and land your dream job.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                            <CardDescription>
                                We are building a comprehensive toolkit to help you with your placement preparation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-16 text-muted-foreground">
                            <GraduationCap className="mx-auto h-12 w-12" />
                            <p className="mt-4">Interview questions, company insights, and more are on the way!</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
