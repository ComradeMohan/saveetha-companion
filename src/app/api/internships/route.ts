
'use server';

import { NextResponse, NextRequest } from 'next/server';

interface Internship {
    id: string;
    title: string;
    organization: string;
    organization_logo: string;
    locations_derived: string[];
    employment_type: string[];
    url: string;
    date_posted: string;
}

interface ApiResponse {
    jobs: Internship[];
}

export interface TransformedInternship {
  id: string;
  title: string;
  organization: string;
  logoUrl: string;
  location: string;
  employmentType: string;
  url: string;
  postedDate: string;
}

export async function GET(request: NextRequest) {
  
  // IMPORTANT: The API Key should be stored in an environment variable.
  const apiKey = process.env.RAPIDAPI_KEY || "a9eacada21msh01c0d12c84e3501p105fedjsn739db62b3f0b";
  if (!apiKey) {
      return new NextResponse(JSON.stringify({ message: 'Missing RapidAPI Key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch('https://intern.p.rapidapi.com/internships', {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'intern.p.rapidapi.com'
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch from Intern API: ${response.statusText} - ${errorText}`);
    }

    const data: ApiResponse = await response.json();

    const transformedInternships: TransformedInternship[] = data.jobs.map((job: Internship) => ({
        id: job.id,
        title: job.title,
        organization: job.organization,
        logoUrl: job.organization_logo,
        location: job.locations_derived?.[0] || 'Not specified',
        employmentType: job.employment_type?.[0] || 'INTERN',
        url: job.url,
        postedDate: job.date_posted,
    }));
    
    return NextResponse.json({
        internships: transformedInternships,
    });

  } catch (error: any) {
    console.error("API Error fetching internships:", error.message);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch internship data.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
