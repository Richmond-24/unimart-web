/** Sync JWT to a cookie so Next.js middleware can read auth state. */
const COOKIE_NAME = 'unimart:token';
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME.replace(':', '\\:')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Persist token to localStorage + cookie in one synchronous call (before navigation). */
export function persistAuthToken(token: string): void {
  try {
    localStorage.setItem('unimart:token', token);
  } catch {
    // ignore
  }
  setAuthCookie(token);
}
