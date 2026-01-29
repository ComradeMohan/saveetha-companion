
'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download, Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export default function QrGeneratorPage() {
  const { user, loading: authLoading } = useAuth();
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQrCode = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to generate a QR code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#F59E0B', // Saffron (Orange) - from the primary theme color
          light: '#00000000' // Transparent background
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code. Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
     if(authLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    if (!user) {
        return (
            <div className="text-center">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You must be logged in to use the QR Code Generator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In to Continue</Link>
                    </Button>
                </CardContent>
            </div>
        );
    }

    return (
        <>
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                QR Code Generator
                </CardTitle>
                <CardDescription>
                Enter any URL to create a downloadable, themed QR code instantly.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="url-input">URL</Label>
                <Input
                    id="url-input"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                </div>
                <Button onClick={generateQrCode} disabled={loading} className="w-full">
                {loading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                    </>
                ) : (
                    'Generate QR Code'
                )}
                </Button>
                {qrCodeDataUrl && (
                <div className="mt-6 flex flex-col items-center gap-4 animate-fade-in">
                    <p className="text-sm font-medium text-muted-foreground">Your QR Code is ready!</p>
                    <div className="p-4 bg-white rounded-lg border">
                    <Image src={qrCodeDataUrl} alt="Generated QR Code" width={200} height={200} />
                    </div>
                    <Button asChild variant="outline">
                    <a href={qrCodeDataUrl} download="qrcode.png">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </a>
                    </Button>
                </div>
                )}
            </CardContent>
        </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto shadow-lg">
                {renderContent()}
            </Card>
        </div>
    </div>
  );
}
