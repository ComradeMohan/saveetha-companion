
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, Construction } from "lucide-react";

export default function AdminNotificationsPage() {

    // This is a placeholder page.
    // The UI and logic to send notifications will be added in a future step.

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Send Notifications</h2>
                    <p className="text-muted-foreground">
                        Broadcast messages to all users who have enabled notifications.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compose Notification</CardTitle>
                    <CardDescription>
                        This feature is currently under construction.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center gap-4 py-16">
                    <Construction className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">The ability to send push notifications from this dashboard is coming soon!</p>
                </CardContent>
            </Card>
        </div>
    );
}
