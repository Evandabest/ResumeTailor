import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { latex } = await request.json();
    
    console.log("API: Received LaTeX content", { length: latex?.length });
    
    if (!latex) {
      return NextResponse.json({ error: 'No LaTeX content provided' }, { status: 400 });
    }
    
    console.log("API: Sending request to local LaTeX compiler");
    
    const response = await fetch('http://localhost:3001', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latex })
    });
    
    console.log("API: Response status:", response.status);
    
    const data = await response.json();
    
    if (data.success) {
      console.log("API: Successfully generated PDF");
      return NextResponse.json({
        success: true,
        pdf: data.pdf
      });
    }
    
    throw new Error(data.error || 'LaTeX compilation failed');
    
  } catch (error) {
    console.error("API: Error in compile-latex", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to compile LaTeX'
    }, { status: 500 });
  }
}