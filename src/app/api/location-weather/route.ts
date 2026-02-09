import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = forwardedFor?.split(',')[0]?.trim();

    if (!realIp) {
      throw new Error('Client IP not found');
    }

    // ✅ HTTPS geo lookup
    const geoResponse = await fetch(
      `https://ipapi.co/${realIp}/json/`,
      { next: { revalidate: 86400 } }
    );

    if (!geoResponse.ok) {
      throw new Error('Geolocation fetch failed');
    }

    const geoData = await geoResponse.json();

    const latitude = geoData.latitude;
    const longitude = geoData.longitude;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      throw new Error('Invalid latitude/longitude');
    }

    // ✅ Weather lookup
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`,
      { next: { revalidate: 900 } }
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather fetch failed');
    }

    const weatherData = await weatherResponse.json();

    return NextResponse.json({
      location: {
        ip: geoData.ip,
        city: geoData.city,
        country_name: geoData.country_name,
        latitude,
        longitude,
      },
      weather: {
        temperature: weatherData.current.temperature_2m,
        weathercode: weatherData.current.weather_code,
        windspeed: weatherData.current.wind_speed_10m,
        relativehumidity: weatherData.current.relative_humidity_2m,
      },
    });

  } catch (error: any) {
    console.error('[API /api/location-weather]', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
