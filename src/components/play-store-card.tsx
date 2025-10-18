
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const PlayStoreIcon = () => (
  <img 
      src="https://img.icons8.com/?size=200&id=118633&format=png" 
      alt="Play Store" 
      className="h-10 w-10 mr-2"
  />
);


export default function PlayStoreCard() {

  return (
    <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg">
      <CardHeader>
        <CardTitle>Get Our Mobile App</CardTitle>
        <CardDescription className="text-primary-foreground/80">
            Access all learning features on the go with our official app.coming to prodcution in few days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
            asChild
            variant="secondary"
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Link href="https://univault.live" target="_blank" rel="noopener noreferrer">
            <PlayStoreIcon />
            Get it on Play Store
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
