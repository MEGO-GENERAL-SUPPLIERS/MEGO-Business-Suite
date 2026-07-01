/**
 * Normalizes IApiResponse.message (string | string[] | null | undefined)
 * into a single displayable string, without touching IApiResponse itself.
 */
export function normalizeMessage(
  message: string | string[] | null | undefined,
  fallback: string
): string {
  if (!message) return fallback;
  return Array.isArray(message) ? message.join(', ') : message;
}