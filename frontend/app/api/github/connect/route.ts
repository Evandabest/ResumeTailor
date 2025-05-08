import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user_to_token/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: token,
        column: 'github'
      }),
      credentials: 'include'  // to include cookies for authentication
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to connect GitHub account' },
        { status: response.status }
      );
    }

    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error connecting GitHub account:', error);
    return NextResponse.json(
      { error: 'Failed to connect GitHub account' },
      { status: 500 }
    );
  }
}
