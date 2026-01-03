
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Wind, Droplets, Thermometer, Sun, Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationData {
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
  ip: string;
}

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  relativehumidity: number;
}

const weatherIcons: { [key: number]: React.ElementType } = {
  0: Sun, // Clear sky
  1: Sun, // Mainly clear
  2: Cloud, // Partly cloudy
  3: Cloud, // Overcast
  45: Cloud, // Fog
  48: Cloud, // Depositing rime fog
  51: CloudRain, // Drizzle: Light
  53: CloudRain, // Drizzle: Moderate
  55: CloudRain, // Drizzle: Dense
  61: CloudRain, // Rain: Slight
  63: CloudRain, // Rain: Moderate
  65: CloudRain, // Rain: Heavy
  80: CloudRain, // Rain showers: Slight
  81: CloudRain, // Rain showers: Moderate
  82: CloudRain, // Rain showers: Violent
  71: CloudSnow, // Snow fall: Slight
  73: CloudSnow, // Snow fall: Moderate
  75: CloudSnow, // Snow fall: Heavy
  95: Zap, // Thunderbolt
  96: Zap,
  99: Zap,
};

const getWeatherDescription = (code: number): string => {
    switch (code) {
        case 0: return "Clear sky";
        case 1: return "Mainly clear";
        case 2: return "Partly cloudy";
        case 3: return "Overcast";
        case 45: case 48: return "Fog";
        case 51: case 53: case 55: return "Drizzle";
        case 61: return "Slight rain";
        case 63: return "Moderate rain";
        case 65: return "Heavy rain";
        case 80: case 81: case 82: return "Rain showers";
        case 71: case 73: case 75: return "Snow fall";
        case 95: case 96: case 99: return "Thunderstorm";
        default: return "Unknown";
    }
};

function WeatherCardSkeleton() {
    return (
        <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-16 w-32" />
                <div className="grid grid-cols-3 gap-4 w-full pt-4">
                    <div className="text-center space-y-2">
                        <Skeleton className="h-6 w-6 mx-auto" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                        <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                    <div className="text-center space-y-2">
                        <Skeleton className="h-6 w-6 mx-auto" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                        <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                    <div className="text-center space-y-2">
                        <Skeleton className="h-6 w-6 mx-auto" />
                        <Skeleton className="h-4 w-16 mx-auto" />
                        <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function WeatherToolPage() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVisitorData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get Geolocation and IP from ipapi.co
        const geoResponse = await fetch('https://ipapi.co/json/');
        if (!geoResponse.ok) throw new Error('Could not fetch geolocation data.');
        const geoData: LocationData = await geoResponse.json();
        
        console.log("IP:", geoData.ip);
        console.log("City:", geoData.city);
        
        setLocation(geoData);
        toast({
          title: "Location Detected",
          description: `Weather is being fetched for ${geoData.city}, ${geoData.country_name}.`,
        });

        // 2. Get Weather from Geolocation
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=ms`);
        if (!weatherResponse.ok) throw new Error('Could not fetch weather data.');
        const weatherData = await weatherResponse.json();
        setWeather({
            temperature: weatherData.current.temperature_2m,
            weathercode: weatherData.current.weather_code,
            windspeed: weatherData.current.wind_speed_10m,
            relativehumidity: weatherData.current.relative_humidity_2m,
        });

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred. You might be using a VPN.');
        toast({
          title: "Error",
          description: err.message || "Failed to fetch weather data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [toast]);

  const WeatherIcon = weather ? weatherIcons[weather.weathercode] || Sun : Sun;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Your Local Weather</h2>
        <p className="text-muted-foreground mt-2">
          Displaying current weather conditions based on your public IP address.
        </p>
      </div>

      {loading && <WeatherCardSkeleton />}

      {!loading && error && (
        <Card className="max-w-md mx-auto text-center text-destructive border-destructive/50">
            <CardHeader>
                <CardTitle>Failed to Fetch Data</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                <Button variant="destructive" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
        </Card>
      )}

      {!loading && location && weather && (
        <Card className="max-w-md mx-auto shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2"><MapPin className="h-6 w-6 text-primary" /> {location.city}, {location.country_name}</CardTitle>
                <CardDescription>IP Address: {location.ip}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <WeatherIcon className="h-24 w-24 text-primary" />
                <div className="text-center">
                    <p className="text-7xl font-bold">{Math.round(weather.temperature)}°C</p>
                    <p className="text-muted-foreground capitalize">{getWeatherDescription(weather.weathercode)}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full pt-4">
                    <div className="text-center">
                        <Wind className="h-6 w-6 mx-auto text-muted-foreground mb-1"/>
                        <p className="font-bold">{weather.windspeed.toFixed(1)} m/s</p>
                        <p className="text-xs text-muted-foreground">Wind</p>
                    </div>
                    <div className="text-center">
                        <Droplets className="h-6 w-6 mx-auto text-muted-foreground mb-1"/>
                        <p className="font-bold">{weather.relativehumidity}%</p>
                        <p className="text-xs text-muted-foreground">Humidity</p>
                    </div>
                    <div className="text-center">
                        <Thermometer className="h-6 w-6 mx-auto text-muted-foreground mb-1"/>
                         <p className="font-bold">{weather.temperature}°C</p>
                        <p className="text-xs text-muted-foreground">Feels Like</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
