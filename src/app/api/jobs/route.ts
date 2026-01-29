
'use server';

import { NextResponse, NextRequest } from 'next/server';

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  url: string;
  description: string;
}

interface ApiResponse {
  jobs: Job[];
}

export interface TransformedJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string;
  category: string;
  jobType: string;
  publicationDate: string;
  location: string;
  salary: string;
  url: string;
  description: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';

  try {
    const response = await fetch(`https://remotive.com/api/remote-jobs?limit=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch from Remotive: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    const transformedJobs: TransformedJob[] = data.jobs.map((job: Job) => ({
      id: job.id,
      title: job.title,
      companyName: job.company_name,
      companyLogo: job.company_logo,
      category: job.category,
      jobType: job.job_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      publicationDate: job.publication_date,
      location: job.candidate_required_location,
      salary: job.salary,
      url: job.url,
      description: job.description,
    }));
    
    return NextResponse.json({
        jobs: transformedJobs,
    });

  } catch (error: any) {
    console.error("API Error fetching jobs:", error.message);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch job data.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
