
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md">
        <Ghost className="mx-auto h-24 w-24 animate-bounce text-primary" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          404 - Page Lost
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Oops! It seems this page has gone rogue. Not even our AI could track it down. Let's get you back to familiar territory.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            Go Back Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
