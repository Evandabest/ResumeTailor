import { type NextRequest } from 'next/server';
import { getToken } from '@/lib/get-token';

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const token = getToken(cookies);

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Making request to backend with filters:', body);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/projects/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        min_stars: body.minStars || 0,
        is_archived: body.isArchived || false,
        include: body.include || [],
        exclude: body.exclude || [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error in /api/github/projects:', error);
    return Response.json({ 
      error: 'Failed to fetch GitHub projects',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
