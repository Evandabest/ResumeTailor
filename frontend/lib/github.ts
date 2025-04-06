export async function linkGitHubAccount() {
  try {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (!token) {
      throw new Error('GitHub token not configured');
    }

    const response = await fetch('/api/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'link',
        code: token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to link GitHub account');
    }

    return data;
  } catch (error) {
    console.error('GitHub link error:', error);
    throw error;
  }
}

export interface GitHubProject {
  name: string;
  url: string;
  description?: string;
  stars: number;
  languages: string[];
  created_at: string;
  updated_at: string;
  is_fork: boolean;
}

export async function listGitHubProjects(options: {
  min_stars?: number;
  is_archived?: boolean;
  include?: string[];
  exclude?: string[];
  only?: string[];
}) {
  try {
    const response = await fetch('/api/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'projects/list',
        ...options,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to list GitHub projects');
    }

    return data.repos as GitHubProject[];
  } catch (error) {
    console.error('GitHub list projects error:', error);
    throw error;
  }
}

export async function importGitHubProjects(repos: string[]) {
  try {
    const response = await fetch('/api/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'projects/import',
        repos,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to import GitHub projects');
    }

    return data;
  } catch (error) {
    console.error('GitHub import error:', error);
    throw error;
  }
}

export async function unlinkGitHubAccount() {
  try {
    const response = await fetch('/api/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'unlink',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to unlink GitHub account');
    }

    return data;
  } catch (error) {
    console.error('GitHub unlink error:', error);
    throw error;
  }
}
