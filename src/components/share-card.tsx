
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ShareCard() {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: 'Saveetha Companion',
      text: 'Check out the Saveetha Companion app! It has a CGPA calculator, attendance tracker, faculty directory, and more. A must-have for all students.',
      url: 'https://saveetha-companion.web.app', // Replace with your actual app URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link Copied!',
          description: "The app link has been copied to your clipboard. Share it with your friends!",
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
      toast({
        title: 'Error',
        description: 'Could not share at this moment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg">
      <CardHeader>
        <CardTitle>Enjoying the App?</CardTitle>
        <CardDescription className="text-primary-foreground/80">
            Help your friends by sharing this all-in-one tool.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
            onClick={handleShare}
            variant="secondary"
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share with Friends
        </Button>
      </CardContent>
    </Card>
  );
}
