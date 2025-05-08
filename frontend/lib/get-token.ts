type TokenType = 'token' | 'refresh_token';

/**
 * Helper function to extract a token from cookies
 */
export function getTokenFromCookies(cookies: string, type: TokenType = 'token'): string | null {
  // Try to get from cookie
  const token = cookies.split(';')
    .find(c => c.trim().startsWith(`${type}=`))
    ?.split('=')[1];

  if (!token) {
    console.error(`No ${type} found in cookies`);
    return null;
  }

  return token;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getTokenFromCookies instead
 */
export function getToken(cookies: string): string | null {
  return getTokenFromCookies(cookies, 'token');
}
