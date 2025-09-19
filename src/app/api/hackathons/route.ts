
import { NextResponse } from 'next/server';

// Simplified interface to match what the frontend expects
interface Hackathon {
  id: string;
  title: string;
  organization: string;
  date: string;
  mode: 'Online' | 'In-Person';
  location?: string;
  description: string;
  url: string;
}

// This interface matches the actual, observed structure from the Devpost API
interface DevpostHackathon {
    id: number;
    title: string;
    url: string;
    organization_name: string | null;
    submission_period_dates: string; // This is a pre-formatted string, e.g., "Jul 31 - Oct 01, 2025"
    displayed_location: {
        location: string;
    };
}

export async function GET() {
  try {
    const response = await fetch('https://devpost.com/api/hackathons?status=open&page=1', {
      // Devpost doesn't require an API key for this public endpoint.
      // We add a cache-revalidation strategy to get fresh data periodically.
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from Devpost: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform the complex Devpost response into our simple frontend format
    const transformedHackathons: Hackathon[] = data.hackathons.map((h: DevpostHackathon) => ({
        id: h.id.toString(),
        title: h.title,
        organization: h.organization_name || 'N/A',
        date: h.submission_period_dates, // Use the pre-formatted date string directly
        mode: h.displayed_location.location.toLowerCase().includes('online') ? 'Online' : 'In-Person',
        location: h.displayed_location.location,
        description: `Join the ${h.title} hackathon hosted by ${h.organization_name || 'the organizers'}.`,
        url: h.url,
    }));
    
    return NextResponse.json(transformedHackathons);

  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch hackathon data from Devpost.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
