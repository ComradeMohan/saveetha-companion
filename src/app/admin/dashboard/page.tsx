
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BookOpen, DollarSign, MessageSquare, Users } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faculty Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">
              Total faculty in directory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concept Maps</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
             <p className="text-xs text-muted-foreground">
              Total maps available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-8">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-muted-foreground mr-4"/>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    New user signed up.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    user@saveetha.com
                  </p>
                </div>
                <div className="ml-auto font-medium">2m ago</div>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mr-4"/>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    New contact message.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From: student@example.com
                  </p>
                </div>
                <div className="ml-auto font-medium">1h ago</div>
              </div>
               <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-muted-foreground mr-4"/>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    New concept map added.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Topic: "Data Structures"
                  </p>
                </div>
                <div className="ml-auto font-medium">3h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
