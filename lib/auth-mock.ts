export const AUTH_COOKIE = 'qaudit_auth';

export function setMockSession() {
  document.cookie = `${AUTH_COOKIE}=1; Path=/; SameSite=Lax`;
}

export function clearMockSession() {
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function hasValidSession(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes(`${AUTH_COOKIE}=1`);
}
