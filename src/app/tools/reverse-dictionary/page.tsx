
'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Book, Loader2, Search, LogIn } from 'lucide-react';
import { debounce } from 'lodash';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WordResult {
  word: string;
  defs: string[];
}

export default function ReverseDictionaryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<WordResult[]>([]);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchWords = useCallback(debounce(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(query)}&md=d`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching from Datamuse API:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch word suggestions. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, 300), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    fetchWords(query);
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
                    <CardDescription>You must be logged in to use the Reverse Dictionary.</CardDescription>
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
                    <Book className="h-6 w-6 text-primary" />
                    Reverse Dictionary
                </CardTitle>
                <CardDescription>
                    Find words by their meaning or description. Start typing to see the magic happen.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="e.g., a fear of open spaces"
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-4">
                    {loading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    )}
                    {!loading && results.length > 0 && (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {results.map((result) => (
                        <div key={result.word} className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg text-primary">{result.word}</h3>
                            {result.defs && result.defs.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {result.defs[0].replace('n	', '')}
                            </p>
                            )}
                        </div>
                        ))}
                    </div>
                    )}
                    {!loading && searchTerm.length >= 3 && results.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No results found for "{searchTerm}".</p>
                    </div>
                    )}
                </div>
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
