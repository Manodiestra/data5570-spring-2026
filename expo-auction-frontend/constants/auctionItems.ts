/**
 * Auction item type aligned with Django AuctionItem (auctions/models.py).
 * auction_event is the foreign key to AuctionEvent.
 */
export type AuctionItemStatus = 'draft' | 'published' | 'sold' | 'cancelled';

export type AuctionItem = {
  id: number;
  auction_event: number;
  name: string;
  description: string;
  image_url: string | null;
  /** Cognito user id (JWT `sub`) — set by the API on create. */
  owner_sub: string;
  /**
   * Optional display name if the API provides it (recommended: Django profile keyed by `sub`).
   */
  owner_display_name?: string | null;
  starting_price: number;
  current_price: number;
  status: AuctionItemStatus;
  created_at: string;
  updated_at: string;
  sold_at: string | null;
  sold_to_sub: string | null;
  sold_to_display_name?: string | null;
  auction_event_name?: string;
};

export const MOCK_AUCTION_ITEMS: AuctionItem[] = [
  {
    id: 1,
    auction_event: 1,
    name: 'Vintage Oil Painting',
    description: 'Early 20th century landscape, framed. Good condition.',
    image_url: null,
    owner_sub: 'mock-cognito-sub-alice',
    owner_display_name: 'Alice',
    starting_price: 150,
    current_price: 200,
    status: 'published',
    created_at: '2026-01-10T10:00:00',
    updated_at: '2026-01-10T10:00:00',
    sold_at: null,
    sold_to_sub: null,
  },
  {
    id: 2,
    auction_event: 1,
    name: 'Silver Candelabra Set',
    description: 'Pair of antique sterling silver three-arm candelabras, circa 1890.',
    image_url: null,
    owner_sub: 'mock-cognito-sub-alice',
    owner_display_name: 'Alice',
    starting_price: 320,
    current_price: 320,
    status: 'published',
    created_at: '2026-01-10T10:15:00',
    updated_at: '2026-01-10T10:15:00',
    sold_at: null,
    sold_to_sub: null,
  },
  {
    id: 3,
    auction_event: 1,
    name: 'Porcelain Figurine',
    description: 'Hand-painted European porcelain figurine, signed.',
    image_url: null,
    owner_sub: 'mock-cognito-sub-bob',
    owner_display_name: 'Bob',
    starting_price: 85,
    current_price: 95,
    status: 'published',
    created_at: '2026-01-10T11:00:00',
    updated_at: '2026-01-10T11:00:00',
    sold_at: null,
    sold_to_sub: null,
  },
];
