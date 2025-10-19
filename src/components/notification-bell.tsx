
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db, messaging } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Gift, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getToken } from 'firebase/messaging';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: any;
  type: 'credit' | 'default';
}

export function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user || permission !== 'granted') return;

    const notifsRef = collection(db, 'user_notifications', user.uid, 'notifications');
    const q = query(notifsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifsData: Notification[] = [];
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.read) {
          count++;
        }
        notifsData.push({ id: doc.id, ...data } as Notification);
      });
      setNotifications(notifsData);
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user, permission]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (!open && unreadCount > 0 && user && permission === 'granted') {
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const notif of unreadNotifs) {
        const notifRef = doc(db, 'user_notifications', user.uid, 'notifications', notif.id);
        await updateDoc(notifRef, { read: true });
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsEnabling(true);
    if (!messaging || !user || !process.env.NEXT_PUBLIC_FCM_VAPID_KEY) {
        toast({ title: "Error", description: "FCM is not configured correctly.", variant: "destructive"});
        setIsEnabling(false);
        return;
    }

    try {
        const requestedPermission = await Notification.requestPermission();
        setPermission(requestedPermission);

        if (requestedPermission === 'granted') {
            const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            const fcmToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
                serviceWorkerRegistration: swRegistration,
            });

            if (fcmToken) {
                const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', fcmToken);
                await setDoc(tokenRef, { createdAt: serverTimestamp() }, { merge: true });
                
                toast({
                    title: "Notifications Enabled!",
                    description: "Your device is now registered for push notifications.",
                });

                // Send a test notification
                 navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('Saveetha Companion', {
                        body: 'You have successfully enabled notifications!',
                        icon: '/favicon.ico',
                        data: { url: window.location.origin } // Payload
                    });
                });

            }
        } else {
            toast({
              title: "Notifications Blocked",
              description: "You can enable notifications from your browser settings.",
              variant: "destructive",
            });
        }
    } catch (error) {
        console.error('Error enabling notifications:', error);
        toast({ title: "Error", description: "Could not enable notifications.", variant: "destructive"});
    } finally {
        setIsEnabling(false);
    }
  }
  
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'credit':
        return <Gift className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  }


  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary justify-center items-center text-xs text-primary-foreground">
                {unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 font-medium border-b">
          <h4>Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {permission === 'granted' ? (
            notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 border-b flex items-start gap-3",
                    !notif.read && "bg-secondary/50"
                  )}
                >
                  <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center p-8">
                You have no notifications.
              </p>
            )
          ) : (
            <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                    {permission === 'denied' 
                        ? "You have blocked notifications. Please enable them in your browser settings to receive updates."
                        : "Enable push notifications to get important updates directly on your device."}
                </p>
                {permission === 'default' && (
                    <Button onClick={handleEnableNotifications} disabled={isEnabling} className="w-full">
                        {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enable Notifications
                    </Button>
                )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
