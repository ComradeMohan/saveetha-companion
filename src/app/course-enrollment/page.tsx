
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, BookOpen } from 'lucide-react';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CourseEnrollmentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Feature Update</h2>
              <p className="text-muted-foreground mt-2">
                Important information regarding the Enrollment Notifier.
              </p>
            </div>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Enrollment Feature Removed</CardTitle>
                    <CardDescription>
                        To protect student privacy and adhere to college terms, this feature is no longer available.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Notice on Data Privacy & Safety</AlertTitle>
                        <AlertDescription>
                            For your safety, please **do not share your college portal credentials** on any third-party website, including this one.
                        </AlertDescription>
                    </Alert>

                    <p className="text-sm text-muted-foreground">
                        We previously explored an enrollment assistance feature, but to respect college terms and ensure student data privacy, it has been permanently removed.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        You can continue using our other tools for study planning, PDF organization, and academic calculations without enrollment access.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/learn">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Explore Learning Tools
                        </Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
         </div>
      </main>
      <Footer />
    </div>
  );
}
