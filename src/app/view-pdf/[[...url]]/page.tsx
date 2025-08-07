
'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PdfViewerPage() {
  const params = useParams();
  const urlSegments = params.url || [];
  const encodedUrl = Array.isArray(urlSegments) ? urlSegments.join('/') : urlSegments;
  
  let pdfUrl = '';
  if (encodedUrl) {
    try {
        pdfUrl = decodeURIComponent(encodedUrl);
    } catch (e) {
        console.error("Failed to decode URL", e);
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28">
        <div className="container mx-auto px-4">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/#concepts">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Concept Maps
                </Link>
            </Button>
        </div>
        <div className="container mx-auto px-4 h-[calc(100vh-12rem)] pb-8">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              className="h-full w-full rounded-lg border"
              aria-label="PDF Viewer Content"
            />
          ) : (
            <Skeleton className="h-full w-full rounded-lg border" />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
