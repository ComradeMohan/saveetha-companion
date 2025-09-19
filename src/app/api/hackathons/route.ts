
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Find the absolute path of the json directory
    const jsonDirectory = path.join(process.cwd(), 'public', 'api');
    // Read the json data file data.json
    const fileContents = await fs.readFile(jsonDirectory + '/hackathons.json', 'utf8');
    // Return the content of the data file in json format
    return NextResponse.json(JSON.parse(fileContents));
  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch hackathon data.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
