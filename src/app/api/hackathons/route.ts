
import { NextResponse, NextRequest } from 'next/server';

// This interface matches the actual, observed structure from the Devpost API
interface DevpostHackathon {
    id: number;
    title: string;
    url: string;
    thumbnail_url: string;
    organization_name: string | null;
    submission_period_dates: string;
    time_left_to_submission: string;
    prize_amount: string;
    registrations_count: number;
    themes: { id: number; name: string }[];
    displayed_location: {
        location: string;
    };
}

interface DevpostApiResponse {
    hackathons: DevpostHackathon[];
    meta: {
        total_pages: number;
        current_page: number;
    };
}

// Our simplified, consistent structure for the frontend
export interface TransformedHackathon {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  organization: string;
  timeLeft: string;
  prizeAmount: string;
  registrations: number;
  themes: string[];
  location: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';

  try {
    const response = await fetch(`https://devpost.com/api/hackathons?status=open&page=${page}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from Devpost: ${response.statusText}`);
    }

    const data: DevpostApiResponse = await response.json();

    const transformedHackathons: TransformedHackathon[] = data.hackathons.map((h: DevpostHackathon) => ({
        id: h.id.toString(),
        title: h.title,
        url: h.url,
        thumbnailUrl: h.thumbnail_url,
        organization: h.organization_name || 'N/A',
        timeLeft: h.time_left_to_submission,
        prizeAmount: h.prize_amount,
        registrations: h.registrations_count,
        themes: h.themes.map(theme => theme.name),
        location: h.displayed_location.location,
    }));
    
    return NextResponse.json({
        hackathons: transformedHackathons,
        totalPages: data.meta.total_pages,
        currentPage: data.meta.current_page,
    });

  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch hackathon data from Devpost.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
