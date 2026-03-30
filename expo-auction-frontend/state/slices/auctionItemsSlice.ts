import { createSlice } from '@reduxjs/toolkit';

import { MOCK_AUCTION_ITEMS } from '@/constants/auctionItems';
import type { AuctionItem } from '@/constants/auctionItems';

export type AuctionItemsState = {
  items: AuctionItem[];
};

const initialState: AuctionItemsState = {
  items: MOCK_AUCTION_ITEMS,
};

const auctionItemsSlice = createSlice({
  name: 'auctionItems',
  initialState,
  reducers: {
    setAuctionItems: (state, action: { payload: AuctionItem[] }) => {
      state.items = action.payload;
    },
    addAuctionItem: (state, action: { payload: AuctionItem }) => {
      state.items.push(action.payload);
    },
  },
});

export const { setAuctionItems, addAuctionItem } = auctionItemsSlice.actions;

export const selectAuctionItems = (state: {
  auctionItems: AuctionItemsState;
}): AuctionItem[] => state.auctionItems.items;

/** Select auction items whose auction_event matches the given event id. */
export const selectAuctionItemsByEventId =
  (eventId: number) =>
  (state: { auctionItems: AuctionItemsState }): AuctionItem[] =>
    state.auctionItems.items.filter((item) => item.auction_event === eventId);

type RootWithAuthItems = {
  auth: { user: { sub: string } | null };
  auctionItems: AuctionItemsState;
};

/** True if the signed-in user's Cognito `sub` matches the item's `owner_sub`. */
export const selectIsAuctionItemOwner =
  (item: AuctionItem) =>
  (state: RootWithAuthItems): boolean => {
    const sub = state.auth.user?.sub;
    return !!sub && item.owner_sub === sub;
  };

/** Items for an event that belong to the current user (by `owner_sub`). */
export const selectMyAuctionItemsByEventId =
  (eventId: number) =>
  (state: RootWithAuthItems): AuctionItem[] => {
    const sub = state.auth.user?.sub;
    if (!sub) return [];
    return state.auctionItems.items.filter(
      (item) => item.auction_event === eventId && item.owner_sub === sub
    );
  };

export default auctionItemsSlice.reducer;
