'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, FileText, Loader2, Send, User, Sun, Cloud, CloudRain, CloudSnow, Zap, Droplets, Thermometer, Wind } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askTutor, TutorOutput } from '@/ai/flows/tutor-flow';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Interfaces and helper components from ai-chat-popover
interface Message {
  role: 'user' | 'bot';
  content: string;
  sources?: TutorOutput['sources'];
}

interface LocationData {
  ip: string;
  city: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  relativehumidity: number;
}

const getWeatherDescription = (code: number): string => {
    switch (code) {
        case 0: return "Clear sky"; case 1: return "Mainly clear"; case 2: return "Partly cloudy";
        case 3: return "Overcast"; case 45: case 48: return "Fog"; case 51: case 53: case 55: return "Drizzle";
        case 61: return "Slight rain"; case 63: return "Moderate rain"; case 65: return "Heavy rain";
        case 80: case 81: case 82: return "Rain showers"; case 71: case 73: case 75: return "Snow fall";
        case 95: case 96: case 99: return "Thunderstorm"; default: return "Unknown";
    }
};

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          View Link
        </a>
      );
    }
    return part;
  });
};

const StreamingText = ({ text, onStreamEnd, onUpdate }: { text: string; onStreamEnd: () => void; onUpdate: () => void; }) => {
    const [displayedText, setDisplayedText] = useState('');
  
    useEffect(() => {
      setDisplayedText(''); 
      if (text) {
        const words = text.split(' ');
        let wordIndex = 0;
        const interval = setInterval(() => {
          if (wordIndex < words.length) {
            setDisplayedText(prev => (prev ? prev + ' ' : '') + words[wordIndex]);
            wordIndex++;
          } else {
            clearInterval(interval);
            onStreamEnd();
          }
        }, 70); 
  
        return () => clearInterval(interval);
      } else {
        onStreamEnd();
      }
    }, [text, onStreamEnd]);

    useEffect(() => {
      onUpdate();
    }, [displayedText, onUpdate]);
  
    return <p className="whitespace-pre-wrap">{linkify(displayedText)}</p>;
};


function AIChatPageContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  const handleStreamEnd = useCallback(() => {
    setLoading(false);
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    const fetchWeatherAndLocation = async () => {
      try {
        const response = await fetch('/api/location-weather');
        if (!response.ok) return;
        const data = await response.json();
        setLocation(data.location);
        setWeather(data.weather);
        
        const welcomeMessage = `
It's currently ${Math.round(data.weather.temperature)}°C and ${getWeatherDescription(data.weather.weathercode).toLowerCase()} in ${data.location.city}.
How can I help you today?
        `.trim();
        setMessages([{ role: 'bot', content: welcomeMessage }]);

      } catch (error) {
        console.error("Weather/Location fetch error on chat page:", error);
        setMessages([{ role: 'bot', content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! How can I help you today?` }]);
      }
    };
    fetchWeatherAndLocation();
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await askTutor({ question: input });
      const botMessage: Message = { role: 'bot', content: result.answer, sources: result.sources };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error asking tutor:', error);
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I encountered an error. Please ensure knowledge has been fed in the admin panel and try again.' };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-lg">
        <CardHeader className="border-b">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>AI Assistant</CardTitle>
                    <CardDescription>{location ? `${location.city}, ${location.country_name}` : "Your personal guide"}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4" viewportRef={viewportRef}>
                 <div className="space-y-6">
                    {messages.map((message, index) => {
                        const isLastMessage = index === messages.length - 1;
                        const isBot = message.role === 'bot';
                        const isStreaming = isBot && isLastMessage && loading;

                        return (
                            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                                {isBot && (
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg p-2.5 max-w-xs sm:max-w-md text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                    {isStreaming ? (
                                        <StreamingText text={message.content} onStreamEnd={handleStreamEnd} onUpdate={scrollToBottom} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{linkify(message.content)}</p>
                                    )}
                                    {message.sources && message.sources.length > 0 && (
                                        <div className="mt-2.5 border-t pt-2">
                                            <h4 className="text-xs font-semibold mb-1.5">Sources:</h4>
                                            <div className="space-y-1">
                                                {message.sources.map(source => (
                                                    <Link key={source.url} href={`/view-pdf/${encodeURIComponent(source.url)}`} target="_blank" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                                                        <FileText className="h-3 w-3" />
                                                        <span className="truncate">{source.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback>{user?.displayName?.[0] || <User className="h-4 w-4"/>}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        );
                    })}
                    {loading && messages.length > 0 && messages[messages.length-1]?.role === 'user' && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-2.5 max-w-xs text-sm bg-secondary flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                 </div>
            </ScrollArea>
        </CardContent>
        <div className="border-t p-3">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1"
                    disabled={loading}
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    </Card>
  )
}


export default function AIChatPage() {
    return (
        <div className="h-screen w-screen flex flex-col">
            <main className="flex-1 flex flex-col p-4 pt-20 md:pt-24 h-full">
                <AIChatPageContent />
            </main>
        </div>
    )
}
