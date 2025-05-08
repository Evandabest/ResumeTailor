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
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/selection/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        data: body.data
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      return Response.json(error, { status: response.status });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in /api/github/selection/set:', error);
    return Response.json({ 
      error: 'Failed to save GitHub project selection',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
