/**
 * Helper to parse Supabase Auth redirect hashes and search parameters
 * in React + Vite Single Page Applications (SPA).
 */
export const parseAuthRedirect = () => {
  if (typeof window === 'undefined') return null;

  // 1. Check URL Hash (Implicit Flow: #access_token=...&type=signup or #error=...)
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(rawHash);

  // 2. Check URL Query Parameters (PKCE Flow: ?code=... or ?error=...)
  const searchParams = new URLSearchParams(window.location.search);

  // Check for Errors in Hash or Search
  const error = hashParams.get('error') || searchParams.get('error');
  const errorDescription =
    hashParams.get('error_description') || searchParams.get('error_description');
  const errorCode = hashParams.get('error_code') || searchParams.get('error_code');

  if (error || errorDescription) {
    let cleanMessage = 'Email confirmation failed. Please try again.';
    if (errorDescription) {
      cleanMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
    } else if (error) {
      cleanMessage = decodeURIComponent(error.replace(/\+/g, ' '));
    }

    return {
      type: 'error',
      message: cleanMessage,
      code: errorCode || error,
    };
  }

  // Check for PKCE Code
  const code = searchParams.get('code');
  if (code) {
    return {
      type: 'code',
      code,
    };
  }

  // Check for Token / Type in Hash
  const authType = hashParams.get('type') || searchParams.get('type');
  const accessToken = hashParams.get('access_token');

  if (authType === 'signup' || authType === 'email_change' || (accessToken && authType)) {
    return {
      type: 'success',
      message: 'Email successfully verified! Your FOODHUB customer account is now confirmed and active.',
      authType,
      accessToken,
    };
  }

  return null;
};

/**
 * Removes auth tokens and error fragments from the browser URL address bar
 * without reloading the page.
 */
export const cleanAuthUrl = () => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  // Remove auth-related search params if present
  searchParams.delete('code');
  searchParams.delete('error');
  searchParams.delete('error_code');
  searchParams.delete('error_description');
  searchParams.delete('type');

  const newSearch = searchParams.toString();
  const newUrl =
    url.pathname +
    (newSearch ? `?${newSearch}` : '');

  window.history.replaceState({}, document.title, newUrl);
};
