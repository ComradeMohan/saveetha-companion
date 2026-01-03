
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Loader2, Send, User, X, Sun, Cloud, CloudRain, CloudSnow, Zap, Droplets, Thermometer, Wind } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askTutor, TutorOutput } from '@/ai/flows/tutor-flow';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';


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


export function AiChatPopover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWeatherAndLocation = async () => {
      setWeatherLoading(true);
      try {
        const geoResponse = await fetch('https://ipapi.co/json/');
        if (!geoResponse.ok) throw new Error('Could not fetch geolocation.');
        const geoData: LocationData = await geoResponse.json();
        setLocation(geoData);

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        if (!weatherResponse.ok) throw new Error('Could not fetch weather data.');
        const weatherData = await weatherResponse.json();
        
        const currentWeatherData = {
            temperature: weatherData.current.temperature_2m,
            weathercode: weatherData.current.weather_code,
            windspeed: weatherData.current.wind_speed_10m,
            relativehumidity: weatherData.current.relative_humidity_2m,
        };
        setWeather(currentWeatherData);
        
        // Save unique visitor data to Firestore
        const sessionKey = 'weather_logged';
        if (!sessionStorage.getItem(sessionKey)) {
            const logData = {
                ...geoData,
                ...currentWeatherData,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent
            };
            // Use IP as document ID to ensure uniqueness per visitor IP
            await setDoc(doc(db, 'visitor_weather_logs', geoData.ip), logData, { merge: true });
            sessionStorage.setItem(sessionKey, 'true');
        }

      } catch (error) {
        console.error("Weather/Location fetch error:", error);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeatherAndLocation();
  }, []);


  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages, loading]);
  
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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        let welcomeMessage = `Hi ${user?.displayName?.split(' ')[0] || 'there'}! How can I help you?`;
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

  return (
    <TooltipProvider>
      <Tooltip>
        <Popover open={open} onOpenChange={handleOpenChange}>
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
            <div className="flex flex-col h-[60vh]">
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
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                    <X className="h-4 w-4"/>
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                      {message.role === 'bot' && (
                        <Avatar className="h-7 w-7">
                          <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("rounded-lg p-2.5 max-w-xs text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.role === 'bot' && message.sources && message.sources.length > 0 && (
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
                  ))}
                  {loading && (
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
  );
}
