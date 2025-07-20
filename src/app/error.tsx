
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md">
        <AlertTriangle className="mx-auto h-24 w-24 text-destructive" />
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Something Went Wrong
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          An unexpected error occurred. You can try to reload the segment or go back to the homepage.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" onClick={() => reset()}>
            Try Again
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
