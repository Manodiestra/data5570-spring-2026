/**
 * Decode JWT payload (middle segment) without verifying the signature.
 * Use only for reading display claims in the client; never trust for authorization.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = segment.length % 4 === 0 ? '' : '='.repeat(4 - (segment.length % 4));
    const padded = segment + pad;
    if (typeof globalThis.atob !== 'function') {
      console.warn('jwtPayload: atob is not available; cannot decode token for display');
      return null;
    }
    const json = globalThis.atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
