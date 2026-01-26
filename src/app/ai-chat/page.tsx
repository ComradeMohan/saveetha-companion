
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Interfaces and helper components
interface Message {
  role: 'user' | 'bot';
  content: string;
  sources?: TutorOutput['sources'];
  actions?: { text: string; query: string }[];
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
          {part}
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
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const forceScroll = useCallback(() => {
    setScrollTrigger(c => c + 1);
  }, []);
  
  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [scrollTrigger]);

  const handleStreamEnd = useCallback(() => {
    setLoading(false);
    forceScroll();
  }, [forceScroll]);

  useEffect(() => {
    const fetchWeatherAndLocation = async () => {
      try {
        const response = await fetch('/api/location-weather');
        if (!response.ok) return;
        const data = await response.json();
        setLocation(data.location);
        setWeather(data.weather);
        
        const welcomeMessage: Message = { 
            role: 'bot', 
            content: `
It's currently ${Math.round(data.weather.temperature)}°C and ${getWeatherDescription(data.weather.weathercode).toLowerCase()} in ${data.location.city}.
How can I help you today?
        `.trim(),
            actions: [
                { text: "Computer Science Courses", query: "List all CSE courses" },
                { text: "About CSA17 (AI)", query: "Tell me about CSA17" },
                { text: "Explain Java", query: "Explain Java" },
            ]
        };
        setMessages([welcomeMessage]);

      } catch (error) {
        console.error("Weather/Location fetch error on chat page:", error);
        setMessages([{
            role: 'bot',
            content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! How can I help you today?`,
            actions: [
                { text: "Computer Science Courses", query: "List all CSE courses" },
                { text: "About CSA17 (AI)", query: "Tell me about CSA17" },
                { text: "Explain Java", query: "Explain Java" },
            ]
        }]);
      }
    };
    fetchWeatherAndLocation();
  }, [user]);

  const saveChatLog = useCallback(() => {
    if (messagesRef.current.length <= 1) {
      return;
    }
    
    let userIdToSave: string;
    let userNameToSave: string;

    if (user) {
      userIdToSave = user.uid;
      userNameToSave = profile?.name || user.displayName || 'Unknown';
    } else {
      if (!sessionIdRef.current) {
        sessionIdRef.current = `anon_${uuidv4()}`;
      }
      userIdToSave = sessionIdRef.current;
      userNameToSave = 'Anonymous';
    }
    
    addDoc(collection(db, 'chat-logs'), {
      userId: userIdToSave,
      userName: userNameToSave,
      messages: messagesRef.current.map(({ sources, actions, ...rest }) => rest),
      createdAt: serverTimestamp(),
      source: 'page'
    }).catch(error => {
      console.error("Error saving chat log:", error);
    });

    messagesRef.current = [];
    if (!user) {
      sessionIdRef.current = null;
    }
  }, [user, profile]);

  useEffect(() => {
    // This function will be called when the component unmounts
    return () => {
      saveChatLog();
    };
  }, [saveChatLog]);

  const handleSendMessage = async (e: React.FormEvent | string) => {
    let currentInput: string;
    const isActionClick = typeof e === 'string';

    if (isActionClick) {
        currentInput = e;
        setMessages(prev => prev.map(m => m.role === 'bot' ? { ...m, actions: undefined } : m));
    } else {
        e.preventDefault();
        currentInput = input;
    }
    
    if (!currentInput.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMessage]);
    
    if (!isActionClick) {
        setInput('');
    }
    setLoading(true);

    try {
      const history = messagesRef.current.map(m => ({role: m.role, content: m.content}));
      const result = await askTutor({ question: currentInput, history });
      const botMessage: Message = { role: 'bot', content: result.answer, sources: result.sources };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error asking tutor:', error);
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I encountered an error. Please ensure knowledge has been fed in the admin panel and try again.' };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };
  
  const handleActionClick = (query: string) => {
    handleSendMessage(query);
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-lg border-0 rounded-none">
        <CardHeader className="border-b">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>Comrade</CardTitle>
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
                                        <StreamingText text={message.content} onStreamEnd={handleStreamEnd} onUpdate={forceScroll} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{linkify(message.content)}</p>
                                    )}
                                     {message.actions && !loading && (
                                        <div className="mt-2.5 border-t pt-2 space-y-2">
                                            {message.actions.map((action, i) => (
                                                <Button key={i} size="sm" variant="outline" className="w-full justify-start h-auto py-1.5 text-left" onClick={() => handleActionClick(action.query)}>
                                                    {action.text}
                                                </Button>
                                            ))}
                                        </div>
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
        <main className="h-screen w-screen flex flex-col">
            <AIChatPageContent />
        </main>
    );
}
