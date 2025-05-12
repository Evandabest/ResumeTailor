import { type NextRequest } from 'next/server';
import { getToken } from '@/lib/get-token';

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const token = getToken(cookies);

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { geminiToken } = await request.json();
    console.log('Setting Gemini token');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_to_token/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        value: geminiToken,
        column: 'gemini'
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
    console.error('Error in /api/gemini/connect:', error);
    return Response.json({ 
      error: 'Failed to set Gemini token',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
