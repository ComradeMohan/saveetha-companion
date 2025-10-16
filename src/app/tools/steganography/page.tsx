
'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, Loader2, UploadCloud, Download, FileImage, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const DELIMITER = '|||||'; // A unique string to mark the end of the message

export default function SteganographyPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('encode');

  // Encode state
  const [encodeImage, setEncodeImage] = useState<File | null>(null);
  const [encodeImagePreview, setEncodeImagePreview] = useState<string>('');
  const [secretMessage, setSecretMessage] = useState('');
  const [encodedImageResult, setEncodedImageResult] = useState<string>('');
  const [isEncoding, setIsEncoding] = useState(false);

  // Decode state
  const [decodeImage, setDecodeImage] = useState<File | null>(null);
  const [decodeImagePreview, setDecodeImagePreview] = useState<string>('');
  const [decodedMessage, setDecodedMessage] = useState<string>('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodingError, setDecodingError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, mode: 'encode' | 'decode') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (mode === 'encode') {
          setEncodeImage(file);
          setEncodeImagePreview(reader.result as string);
          setEncodedImageResult('');
        } else {
          setDecodeImage(file);
          setDecodeImagePreview(reader.result as string);
          setDecodedMessage('');
          setDecodingError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEncode = async () => {
    if (!encodeImage || !secretMessage) {
      toast({ title: 'Error', description: 'Please provide an image and a secret message.', variant: 'destructive' });
      return;
    }
    setIsEncoding(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast({ title: 'Error', description: 'Could not get canvas context.', variant: 'destructive' });
            setIsEncoding(false);
            return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const messageWithDelimiter = secretMessage + DELIMITER;
        const binaryMessage = messageWithDelimiter.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');

        if (binaryMessage.length > data.length / 4 * 3) {
            toast({ title: 'Error', description: 'Message is too long for this image.', variant: 'destructive' });
            setIsEncoding(false);
            return;
        }

        let dataIndex = 0;
        for (let i = 0; i < binaryMessage.length; i++) {
            const bit = parseInt(binaryMessage[i]);
            // Modify the LSB of the R, G, B channels
            data[dataIndex] = (data[dataIndex] & 0xFE) | bit;
            dataIndex += (dataIndex % 4 === 2) ? 2 : 1; // Skip alpha channel
        }
        
        ctx.putImageData(imageData, 0, 0);
        setEncodedImageResult(canvas.toDataURL('image/png'));
        setIsEncoding(false);
        toast({ title: 'Success', description: 'Message hidden successfully!' });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(encodeImage);
  };

  const handleDecode = async () => {
    if (!decodeImage) {
      toast({ title: 'Error', description: 'Please upload an image to decode.', variant: 'destructive' });
      return;
    }
    setIsDecoding(true);
    setDecodingError('');
    setDecodedMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            toast({ title: 'Error', description: 'Could not get canvas context.', variant: 'destructive' });
            setIsDecoding(false);
            return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let binaryMessage = '';
        let charCode = '';

        for (let i = 0; i < data.length; i++) {
             if (i % 4 !== 3) { // Skip alpha channel
                const lsb = data[i] & 1;
                charCode += lsb;
                if (charCode.length === 8) {
                    binaryMessage += String.fromCharCode(parseInt(charCode, 2));
                    charCode = '';
                    if (binaryMessage.endsWith(DELIMITER)) {
                        break;
                    }
                }
            }
        }
        
        if (binaryMessage.endsWith(DELIMITER)) {
            const message = binaryMessage.slice(0, -DELIMITER.length);
            setDecodedMessage(message);
        } else {
            setDecodingError('No hidden message found.');
        }

        setIsDecoding(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(decodeImage);
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
                    <CardDescription>You must be logged in to use the Steganography tool.</CardDescription>
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
                <Eye className="h-6 w-6 text-primary" />
                Steganography Playground
              </CardTitle>
              <CardDescription>
                Hide a secret message inside an image, or reveal one from an image you upload.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="encode">Encode Message</TabsTrigger>
                  <TabsTrigger value="decode">Decode Message</TabsTrigger>
                </TabsList>
                <TabsContent value="encode" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="encode-image">Upload Image</Label>
                    <Input id="encode-image" type="file" accept="image/png, image/jpeg" onChange={(e) => handleImageChange(e, 'encode')} />
                  </div>
                  {encodeImagePreview && <Image src={encodeImagePreview} alt="Encode preview" width={200} height={200} className="rounded-md border p-2" />}
                  <div className="space-y-2">
                    <Label htmlFor="secret-message">Secret Message</Label>
                    <Textarea id="secret-message" placeholder="Your secret message here..." value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)} />
                  </div>
                  <Button onClick={handleEncode} disabled={isEncoding} className="w-full">
                    {isEncoding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Hiding...</> : 'Hide Message'}
                  </Button>
                  {encodedImageResult && (
                    <div className="space-y-3 pt-4 border-t text-center">
                        <h3 className="font-semibold">Your Encoded Image:</h3>
                        <Image src={encodedImageResult} alt="Encoded result" width={200} height={200} className="rounded-md border p-2 mx-auto" />
                        <Button asChild variant="secondary">
                            <a href={encodedImageResult} download="encoded-image.png"><Download className="mr-2 h-4 w-4" /> Download Image</a>
                        </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="decode" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="decode-image">Upload Image</Label>
                    <Input id="decode-image" type="file" accept="image/png" onChange={(e) => handleImageChange(e, 'decode')} />
                  </div>
                  {decodeImagePreview && <Image src={decodeImagePreview} alt="Decode preview" width={200} height={200} className="rounded-md border p-2" />}
                  <Button onClick={handleDecode} disabled={isDecoding} className="w-full">
                    {isDecoding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Revealing...</> : 'Reveal Message'}
                  </Button>
                  {(decodedMessage || decodingError) && (
                    <div className="space-y-3 pt-4 border-t">
                        <h3 className="font-semibold">Decoded Result:</h3>
                        {decodedMessage ? (
                            <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">{decodedMessage}</pre>
                        ) : (
                            <p className="text-destructive text-sm">{decodingError}</p>
                        )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
        </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto shadow-lg">
            {renderContent()}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
