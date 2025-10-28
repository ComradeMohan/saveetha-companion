
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db, messaging } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, setDoc, serverTimestamp, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Gift, Loader2, Link as LinkIcon, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getToken } from 'firebase/messaging';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  type: 'credit' | 'default' | 'announcement';
  link?: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabling, setIsEnabling] = useState(false);
  const hasAutoOpened = useRef(false);
  const unsubscribeRef = useRef<() => void | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
    }

    if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
    };

    const notifsRef = collection(db, 'user_notifications', user.uid, 'notifications');
    const q = query(notifsRef, orderBy('createdAt', 'desc'));

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
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

      // Auto-open logic
      if (count > 0 && !hasAutoOpened.current) {
        const sessionKey = 'notifAutoOpened';
        const sessionValue = sessionStorage.getItem(sessionKey);
        if (!sessionValue) {
           setIsOpen(true);
           hasAutoOpened.current = true;
           sessionStorage.setItem(sessionKey, 'true');
        }
      }
    });

    return () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }
    };
  }, [user]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0 && user) {
      const batch = writeBatch(db);
      notifications.forEach(notif => {
        if (!notif.read) {
            const notifRef = doc(db, 'user_notifications', user.uid, 'notifications', notif.id);
            batch.update(notifRef, { read: true });
        }
      });
      await batch.commit();
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent the popover from closing
    if (!user) return;

    try {
        const notifRef = doc(db, 'user_notifications', user.uid, 'notifications', notificationId);
        await deleteDoc(notifRef);
        toast({
            title: "Notification Deleted",
            description: "The notification has been removed.",
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        toast({
            title: "Error",
            description: "Could not delete the notification.",
            variant: "destructive",
        });
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

                 navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('Saveetha Companion', {
                        body: 'You have successfully enabled notifications!',
                        icon: '/favicon.ico',
                        data: { url: window.location.origin }
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
      case 'announcement':
        return <Bell className="h-5 w-5 text-blue-500" />;
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
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-4 border-b flex items-start gap-3 group relative",
                  !notif.read && "bg-secondary/50"
                )}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  {notif.title && <p className="text-sm font-semibold">{notif.title}</p>}
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  {notif.link && (
                    <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1">
                        <Link href={notif.link} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="h-3 w-3 mr-1" /> View Link
                        </Link>
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : ''}
                  </p>
                </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                    >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete notification</span>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-8">
              You have no notifications.
            </p>
          )}
        </div>
        {permission === 'default' && (
          <div className="p-2 border-t">
            <Button onClick={handleEnableNotifications} disabled={isEnabling} className="w-full" size="sm">
              {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enable Push Notifications
            </Button>
          </div>
        )}
         {permission === 'denied' && (
            <div className="p-3 border-t text-center text-xs text-muted-foreground">
               Push notifications are blocked in your browser settings.
            </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
