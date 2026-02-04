
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const geoResponse = await fetch('https://ipapi.co/json/');
    if (!geoResponse.ok) {
      throw new Error(`Geolocation fetch failed: ${geoResponse.statusText}`);
    }
    const geoData = await geoResponse.json();

    const { latitude, longitude } = geoData;

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
    if (!weatherResponse.ok) {
      throw new Error(`Weather fetch failed: ${weatherResponse.statusText}`);
    }
    const weatherData = await weatherResponse.json();
    const currentWeatherData = {
      temperature: weatherData.current.temperature_2m,
      weathercode: weatherData.current.weather_code,
      windspeed: weatherData.current.wind_speed_10m,
      relativehumidity: weatherData.current.relative_humidity_2m,
    };

    return NextResponse.json({
      location: geoData,
      weather: currentWeatherData
    });

  } catch (error: any) {
    console.error('[API /api/location-weather] Error:', error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
