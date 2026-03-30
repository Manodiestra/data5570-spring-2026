/**
 * Event type aligned with Django AuctionEvent (auctions/models.py).
 * id is client-side only for navigation.
 */
export type AuctionEvent = {
  id: number;
  name: string;
  city: string;
  state: string;
  zip_code: string;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
  updated_at: string;
  /** Cognito user id (JWT `sub`) — set by the API on create. */
  created_by_sub: string;
  /**
   * Optional display name for the creator, if the API exposes it (e.g. from a Django profile table).
   * Until then, the UI can fall back to `displayNameForSub(created_by_sub, currentUser)`.
   */
  created_by_display_name?: string | null;
  is_active: boolean;
  items_count?: number;
};

export const MOCK_EVENTS: AuctionEvent[] = [
  {
    id: 1,
    name: 'Spring Art & Collectibles',
    city: 'Boston',
    state: 'MA',
    zip_code: '02101',
    start_datetime: '2026-03-15T10:00:00',
    end_datetime: '2026-03-15T18:00:00',
    created_at: '2026-01-10T09:00:00',
    updated_at: '2026-01-10T09:00:00',
    created_by_sub: 'mock-cognito-sub-alice',
    created_by_display_name: 'Alice',
    is_active: true,
  },
  {
    id: 2,
    name: 'Vintage Electronics Fair',
    city: 'Austin',
    state: 'TX',
    zip_code: '78701',
    start_datetime: '2026-04-01T09:00:00',
    end_datetime: '2026-04-02T17:00:00',
    created_at: '2026-01-12T14:00:00',
    updated_at: '2026-01-12T14:00:00',
    created_by_sub: 'mock-cognito-sub-bob',
    created_by_display_name: 'Bob',
    is_active: true,
  },
  {
    id: 3,
    name: 'Charity Antiques Auction',
    city: 'Portland',
    state: 'OR',
    zip_code: '97201',
    start_datetime: '2026-05-20T11:00:00',
    end_datetime: '2026-05-21T16:00:00',
    created_at: '2026-01-15T11:30:00',
    updated_at: '2026-01-15T11:30:00',
    created_by_sub: 'mock-cognito-sub-carol',
    is_active: true,
  },
];
