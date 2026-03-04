import { createSlice } from '@reduxjs/toolkit';

import { MOCK_AUCTION_ITEMS } from '@/constants/auctionItems';
import type { AuctionItem } from '@/constants/auctionItems';

type AuctionItemsState = {
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

export default auctionItemsSlice.reducer;
