import type { AuctionItem } from '@/constants/auctionItems';
import { DJANGO_API_BASE } from '@/services/djangoApi';
import { normalizeAuctionItem } from '@/state/slices/auctionItemsSlice';
import { authHeaders } from '@/state/slices/authSlice';

export async function fetchAuctionItemById(id: number): Promise<AuctionItem | null> {
  const res = await fetch(`${DJANGO_API_BASE}/auctionItem/${id}/`);
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as unknown;
  return normalizeAuctionItem(data);
}

export type CreateCheckoutSessionParams = {
  auctionItemId: number;
  customerEmail?: string;
  accessToken: string | null;
};

export async function createCheckoutSession({
  auctionItemId,
  customerEmail,
  accessToken,
}: CreateCheckoutSessionParams): Promise<{ checkout_url: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken ? authHeaders(accessToken) : {}),
  };
  const body: Record<string, unknown> = { auction_item_id: auctionItemId };
  const trimmed = customerEmail?.trim();
  if (trimmed) {
    body.customer_email = trimmed;
  }

  const res = await fetch(`${DJANGO_API_BASE}/payments/create-checkout-session/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { checkout_url?: unknown };
  if (typeof data.checkout_url !== 'string' || !data.checkout_url) {
    throw new Error('Invalid checkout response from server.');
  }
  return { checkout_url: data.checkout_url };
}
