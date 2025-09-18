
'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PenSquare, Copy, Check, Wand2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { findCitations } from '@/ai/flows/citation-finder-flow';
import type { CitationStyle } from '@/ai/flows/citation-finder-flow';

interface FormData {
  authors: string;
  title: string;
  year: string;
  // Website specific
  websiteTitle?: string;
  url?: string;
  // Book specific
  publisher?: string;
  city?: string;
}

export default function CitationGeneratorPage() {
  const { toast } = useToast();
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [generatedCitations, setGeneratedCitations] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const [aiText, setAiText] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCitation = (sourceType: 'website' | 'book') => {
    const { authors, title, year, websiteTitle, url, publisher, city } = formData;

    if (!authors || !title || !year) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    let citation = '';
    const authorList = authors.split(',').map(a => a.trim());
    const formattedAuthors = authorList.length > 1
      ? `${authorList.slice(0, -1).join(', ')} & ${authorList.slice(-1)}`
      : authors;

    switch (style) {
      case 'apa':
        if (sourceType === 'website') {
          citation = `${formattedAuthors}. (${year}). ${title}. *${websiteTitle}*. Retrieved from ${url}`;
        } else { // book
          citation = `${formattedAuthors}. (${year}). *${title}*. ${city}: ${publisher}.`;
        }
        break;
      case 'mla':
        if (sourceType === 'website') {
          citation = `${formattedAuthors}. "${title}." *${websiteTitle}*, ${year}, ${url}.`;
        } else { // book
          citation = `${formattedAuthors}. *${title}*. ${city}: ${publisher}, ${year}.`;
        }
        break;
      case 'chicago':
        if (sourceType === 'website') {
          citation = `${formattedAuthors}. "${title}." ${websiteTitle}. ${year}. ${url}.`;
        } else { // book
          citation = `${formattedAuthors}. *${title}*. ${city}: ${publisher}, ${year}.`;
        }
        break;
    }
    setGeneratedCitations([citation]);
  };
  
  const handleCopy = () => {
    const textToCopy = generatedCitations.join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        toast({ title: "Copied!", description: "Citations copied to clipboard." });
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleAiFind = async () => {
    if (!aiText.trim()) {
        toast({ title: "Error", description: 'Please paste some text for the AI to analyze.', variant: 'destructive' });
        return;
    }
    setIsFinding(true);
    setGeneratedCitations([]);
    try {
        const result = await findCitations({ text: aiText, style: style });
        setGeneratedCitations(result.citations);
        toast({ title: 'Success', description: 'AI has generated a list of relevant citations.' });
    } catch(e) {
        toast({ title: 'Error', description: 'The AI could not generate citations. Please try again.', variant: 'destructive' });
    } finally {
        setIsFinding(false);
    }
  };

  const renderFormFields = (isBook = false) => (
    <>
      <div className="space-y-2">
        <Label htmlFor="authors">Author(s)</Label>
        <Input id="authors" placeholder="e.g., Doe, J., Smith, A." onChange={e => handleInputChange('authors', e.target.value)} />
        <p className="text-xs text-muted-foreground">Separate multiple authors with commas.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">{isBook ? "Book Title" : "Article Title"}</Label>
        <Input id="title" placeholder="e.g., The Future of AI" onChange={e => handleInputChange('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Year of Publication</Label>
        <Input id="year" placeholder="e.g., 2024" onChange={e => handleInputChange('year', e.target.value)} />
      </div>
      {isBook ? (
        <>
            <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input id="publisher" placeholder="e.g., Penguin Books" onChange={e => handleInputChange('publisher', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="city">City of Publication</Label>
                <Input id="city" placeholder="e.g., New York" onChange={e => handleInputChange('city', e.target.value)} />
            </div>
        </>
      ) : (
         <>
            <div className="space-y-2">
                <Label htmlFor="websiteTitle">Website Title</Label>
                <Input id="websiteTitle" placeholder="e.g., Tech Today" onChange={e => handleInputChange('websiteTitle', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" placeholder="https://..." onChange={e => handleInputChange('url', e.target.value)} />
            </div>
        </>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenSquare className="h-6 w-6 text-primary" />
                Citation Generator
              </CardTitle>
              <CardDescription>
                Manually format a citation or use AI to find relevant citations for your text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Citation Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as CitationStyle)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai">Find with AI</TabsTrigger>
                  <TabsTrigger value="website">Website</TabsTrigger>
                  <TabsTrigger value="book">Book</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-text">Paste Your Text</Label>
                    <Textarea 
                        id="ai-text"
                        placeholder="Paste a paragraph or your entire essay here, and the AI will find relevant citations for you."
                        className="min-h-48"
                        value={aiText}
                        onChange={(e) => setAiText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAiFind} disabled={isFinding} className="w-full">
                      {isFinding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Find Citations
                  </Button>
                </TabsContent>
                <TabsContent value="website" className="space-y-4 pt-4">
                  {renderFormFields(false)}
                  <Button onClick={() => generateCitation('website')} className="w-full">Generate Citation</Button>
                </TabsContent>
                <TabsContent value="book" className="space-y-4 pt-4">
                  {renderFormFields(true)}
                  <Button onClick={() => generateCitation('book')} className="w-full">Generate Citation</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
            {generatedCitations.length > 0 && (
              <CardFooter className="flex-col items-start gap-2 border-t pt-6">
                <div className="flex justify-between items-center w-full">
                    <Label>Generated Citations ({generatedCitations.length})</Label>
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                     </Button>
                </div>
                <div className="relative w-full p-4 bg-secondary/50 rounded-md text-sm space-y-4 max-h-64 overflow-y-auto">
                    {generatedCitations.map((citation, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: citation }} />
                    ))}
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
