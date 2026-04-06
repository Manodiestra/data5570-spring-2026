import { DJANGO_API_BASE } from '@/services/djangoApi';

export type UserProfileDto = {
  cognito_sub: string;
  display_name: string;
  updated_at: string;
};

/** GET triggers Django `UserProfile.get_or_create` so a row exists even if a later PATCH failed. */
export async function getMyProfile(accessToken: string): Promise<UserProfileDto> {
  const res = await fetch(`${DJANGO_API_BASE}/profile/me/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<UserProfileDto>;
}

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
