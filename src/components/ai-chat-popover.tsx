
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Loader2, Send, User, X, Sun, Cloud, CloudRain, CloudSnow, Zap, Droplets, Thermometer, Wind, Expand } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askTutor, TutorOutput } from '@/ai/flows/tutor-flow';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from './ui/card';


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

const weatherIcons: { [key: number]: React.ElementType } = {
  0: Sun, 1: Sun, 2: Cloud, 3: Cloud, 45: Cloud, 48: Cloud,
  51: Droplets, 53: Droplets, 55: Droplets, 61: CloudRain, 63: CloudRain, 65: CloudRain,
  80: CloudRain, 81: CloudRain, 82: CloudRain, 71: CloudSnow, 73: CloudSnow, 75: CloudSnow,
  95: Zap, 96: Zap, 99: Zap,
};

const getWeatherDescription = (code: number): string => {
    switch (code) {
        case 0: return "Clear sky"; case 1: return "Mainly clear"; case 2: return "Partly cloudy";
        case 3: return "Overcast"; case 45: case 48: return "Fog"; case 51: case 53: case 55: return "Drizzle";
        case 61: return "Slight rain"; case 63: return "Moderate rain"; case 65: return "Heavy rain";
        case 80: case 81: case 82: return "Rain showers"; case 71: case 73: case 75: return "Snow fall";
        case 95: case 96: case 99: return "Thunderstorm"; default: return "Unknown";
    }
};

const getTemperatureTheme = (temp: number) => {
    if (temp < 10) { // Cool
        return 'bg-blue-500 hover:bg-blue-600';
    }
    if (temp >= 10 && temp <= 25) { // Neutral
        return 'bg-primary hover:bg-primary/90'; // Default
    }
    if (temp > 25 && temp <= 35) { // Warm
        return 'bg-amber-500 hover:bg-amber-600';
    }
    if (temp > 35) { // Hot/Critical
        return 'bg-destructive hover:bg-destructive/90';
    }
    return 'bg-primary hover:bg-primary/90'; // Default fallback
}

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
      setDisplayedText(''); // Reset on new text
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
        }, 70); // Delay between words
  
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

export function AiChatPopover() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const popoverViewportRef = useRef<HTMLDivElement>(null);
  const expandedViewportRef = useRef<HTMLDivElement>(null);
  
  const [scrollTrigger, setScrollTrigger] = useState(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const forceScroll = useCallback(() => {
    setScrollTrigger(c => c + 1);
  }, []);

  useEffect(() => {
    // This function will be called when the component unmounts
    return () => {
      if (user && messagesRef.current.length > 1) { // Only save non-trivial chats
        addDoc(collection(db, 'chat-logs'), {
          userId: user.uid,
          userName: profile?.name || user.displayName || 'Unknown',
          messages: messagesRef.current,
          createdAt: serverTimestamp(),
          source: 'popover'
        }).catch(error => console.error("Error saving chat log on unmount:", error));
      }
    };
  }, [user, profile]);

  useEffect(() => {
    const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };
    scrollToBottom(popoverViewportRef);
    scrollToBottom(expandedViewportRef);
  }, [scrollTrigger]);

  
  const handleStreamEnd = useCallback(() => {
    setLoading(false);
    forceScroll();
  }, [forceScroll]);

  useEffect(() => {
    const fetchWeatherAndLocation = async () => {
      setWeatherLoading(true);
      try {
        const response = await fetch('/api/location-weather');
        if (!response.ok) return;
        const data = await response.json();
        setLocation(data.location);
        setWeather(data.weather);
        
        const sessionKey = 'weather_logged';
        if (!sessionStorage.getItem(sessionKey) && data.location.ip) {
            const logData: any = {
                ...data.location,
                ...data.weather,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
                name: profile?.name || 'anonymous',
                regNo: profile?.regNo || 'not-logged-in',
            };
            await setDoc(doc(db, 'visitor_weather_logs', data.location.ip), logData, { merge: true });
            sessionStorage.setItem(sessionKey, 'true');
        }

      } catch (error) {
        console.error("Weather/Location fetch error:", error);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeatherAndLocation();
  }, [profile]);


  useEffect(() => {
    forceScroll();
  }, [messages, forceScroll]);
  
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        let welcomeMessage = `Hi ${user?.displayName?.split(' ')[0] || 'there'}! How can I help you today?`;
        if (location && weather) {
          welcomeMessage = `
It's currently ${Math.round(weather.temperature)}°C and ${getWeatherDescription(weather.weathercode).toLowerCase()} in ${location.city}.
Wind: ${weather.windspeed.toFixed(1)} m/s, Humidity: ${weather.relativehumidity}%.
How can I help you today?
          `.trim();
        }
        setMessages([{ role: 'bot', content: welcomeMessage }]);
      }, 200);
    }
  }

  const renderChatUI = ({ expanded = false }) => (
    <div className={cn("flex flex-col", expanded ? "h-full" : "h-[60vh]")}>
        <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold">AI Assistant</p>
                    <p className="text-xs text-muted-foreground">{location ? `${location.city}, ${location.country_name}` : "Online"}</p>
                </div>
            </div>
            <div className="flex items-center">
                {!expanded && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsExpanded(true); setOpen(false); }}>
                        <Expand className="h-4 w-4"/>
                    </Button>
                )}
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                    if (expanded) setIsExpanded(false);
                    else setOpen(false);
                }}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>
        </div>
        <ScrollArea className="flex-1 p-4" viewportRef={expanded ? expandedViewportRef : popoverViewportRef}>
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
                            <div className={cn("rounded-lg p-2.5 max-w-xs text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                                {isStreaming ? (
                                    <StreamingText text={message.content} onStreamEnd={handleStreamEnd} onUpdate={forceScroll} />
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
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-3">
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
  );

  return (
    <>
    <TooltipProvider>
      <Tooltip>
        <Popover open={open && !isExpanded} onOpenChange={handleOpenChange}>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button size="icon" className={cn(
                  "rounded-full h-14 w-14 shadow-lg text-lg font-bold text-primary-foreground",
                  "transition-colors duration-500 ease-in-out",
                  weather && getTemperatureTheme(weather.temperature)
              )}>
                {weatherLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : weather ? (
                  `${Math.round(weather.temperature)}°`
                ) : (
                  <Bot className="h-7 w-7" />
                )}
                <span className="sr-only">Open AI Tutor</span>
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-80 sm:w-96 rounded-xl p-0"
            sideOffset={10}
          >
            {renderChatUI({ expanded: false })}
          </PopoverContent>
        </Popover>
         <TooltipContent>
            {weatherLoading ? (
                <p>Loading weather...</p>
            ) : weather && location ? (
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                       <Thermometer className="h-4 w-4" /> {weather.temperature.toFixed(1)}°C
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Droplets className="h-4 w-4" /> {weather.relativehumidity}%
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Wind className="h-4 w-4" /> {weather.windspeed.toFixed(1)} m/s
                    </div>
                </div>
            ) : (
                <p>Weather data unavailable</p>
            )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    {isExpanded && (
        <div 
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300"
            onClick={() => setIsExpanded(false)}
        >
            <div 
                className="fixed inset-4 sm:inset-8 z-[101]"
                onClick={(e) => e.stopPropagation()}
            >
                <Card className="w-full h-full shadow-2xl border flex flex-col">
                    {renderChatUI({ expanded: true })}
                </Card>
            </div>
        </div>
    )}
    </>
  );
}
