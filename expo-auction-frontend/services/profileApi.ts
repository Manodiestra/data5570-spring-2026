import { DJANGO_API_BASE } from '@/services/djangoApi';

export type UserProfileDto = {
  cognito_sub: string;
  display_name: string;
  updated_at: string;
};

export async function patchMyProfile(
  accessToken: string,
  body: { display_name: string }
): Promise<UserProfileDto> {
  const res = await fetch(`${DJANGO_API_BASE}/profile/me/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<UserProfileDto>;
}
