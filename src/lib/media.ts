/**
 * Uploaded images (avatars, group logos) come back from the API as paths on the backend (`/media/avatars/x.webp`):
 * right for the website, which shares their origin, but an app has no origin to resolve them against. Absolute
 * links (partner-shop product pictures) pass through unchanged.
 */
export function resolveMediaUrl(url: string, apiUrl: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) {
    return url;
  }

  return `${apiUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}
