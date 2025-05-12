import { type NextRequest } from 'next/server';
import { getToken } from '@/lib/get-token';

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';
    const token = getToken(cookies);

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current selection state
    const selectionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/selection/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!selectionResponse.ok) {
      const error = await selectionResponse.json();
      console.error('Backend error getting selection:', error);
      return Response.json(error, { status: selectionResponse.status });
    }

    const selectionResult = await selectionResponse.json();
    console.log('Selection data:', selectionResult);

    const body = await request.json();
    console.log('Request body:', body);

    // Require selection data to be saved before import
    if (!selectionResult.data || Object.keys(selectionResult.data).length === 0) {
      return Response.json({ 
        error: 'No project selection found',
        details: 'Please select projects to import before proceeding'
      }, { status: 400 });
    }

    const selectionData = selectionResult.data;
    console.log('Processing with selection data:', selectionData);

    // Only import explicitly selected repos
    const selectedRepos = body.repos.filter((repo: string) => selectionData[repo] === true);
    console.log('Selected repos after filtering:', selectedRepos);

    if (selectedRepos.length === 0) {
      return Response.json({ 
        error: 'No projects selected to import',
        details: 'Please select at least one project to import'
      }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/github/projects/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        repos: selectedRepos
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
    console.error('Error in /api/github/projects/import:', error);
    return Response.json({ 
      error: 'Failed to import GitHub projects',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
