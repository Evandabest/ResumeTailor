import { type NextRequest } from 'next/server';
import { getTokenFromCookies } from '@/lib/get-token';

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const token = getTokenFromCookies(cookies, 'token');

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/projects/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return errors directly to let client-side fetchWithRefresh handle token refresh
      return Response.json(data, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error in /api/github/projects/view:', error);
    return Response.json({ 
      error: 'Failed to fetch GitHub projects',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
