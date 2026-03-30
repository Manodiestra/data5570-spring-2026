/** Django REST API base URL (no trailing slash). */
export const DJANGO_API_BASE =
  process.env.EXPO_PUBLIC_DJANGO_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8000/api';
