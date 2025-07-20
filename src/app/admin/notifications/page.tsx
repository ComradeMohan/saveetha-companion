
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminNotificationsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                    <p className="text-muted-foreground">
                        This page has been moved and integrated into the new Updates system.
                    </p>
                </div>
            </div>

            <Alert>
                <Megaphone className="h-4 w-4" />
                <AlertTitle>This page has moved!</AlertTitle>
                <AlertDescription>
                   To create new announcements and send push notifications, please use the new "Updates" page. It offers a more robust way to manage your communications.
                </AlertDescription>
                <div className="mt-4">
                     <Button asChild>
                        <Link href="/admin/updates">
                           Go to Updates Page <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </Alert>
        </div>
    );
}
