'use server';

import { NextResponse, NextRequest } from 'next/server';

interface RemotiveJob {
    id: number;
    url: string;
    title: string;
    company_name: string;
    company_logo: string;
    category: string;
    tags: string[];
    job_type: string;
    publication_date: string;
    candidate_required_location: string;
    salary: string;
    description: string;
}

interface RemotiveApiResponse {
    'job-count': number;
    jobs: RemotiveJob[];
}

export interface TransformedJob {
  id: string;
  title: string;
  url: string;
  companyName: string;
  companyLogoUrl: string;
  category: string;
  tags: string[];
  jobType: string;
  publicationDate: string;
  location: string;
  salary: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '100'; // Fetch a larger number for client-side pagination

  try {
    const response = await fetch(`https://remotive.com/api/remote-jobs?limit=${limit}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from Remotive API: ${response.statusText}`);
    }

    const data: RemotiveApiResponse = await response.json();

    const transformedJobs: TransformedJob[] = data.jobs.map((job: RemotiveJob) => ({
        id: job.id.toString(),
        title: job.title,
        url: job.url,
        companyName: job.company_name,
        companyLogoUrl: job.company_logo,
        category: job.category,
        tags: job.tags || [],
        jobType: job.job_type,
        publicationDate: job.publication_date,
        location: job.candidate_required_location,
        salary: job.salary,
    }));
    
    return NextResponse.json({
        jobs: transformedJobs,
        jobCount: data['job-count'],
    });

  } catch (error) {
    console.error("API Error fetching jobs:", error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch job data from Remotive.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
