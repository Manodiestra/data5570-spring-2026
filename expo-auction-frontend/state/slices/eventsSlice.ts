import { createSlice } from '@reduxjs/toolkit';

import { MOCK_EVENTS } from '@/constants/events';
import type { AuctionEvent } from '@/constants/events';

type EventsState = {
  items: AuctionEvent[];
};

const initialState: EventsState = {
  items: MOCK_EVENTS,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: { payload: AuctionEvent[] }) => {
      state.items = action.payload;
    },
    addEvent: (state, action: { payload: AuctionEvent }) => {
      console.log('addEvent', action.payload);
      state.items.push(action.payload);
    },
  },
});

export const { setEvents, addEvent } = eventsSlice.actions;

export const selectEvents = (state: { events: EventsState }): AuctionEvent[] =>
  state.events.items;

export default eventsSlice.reducer;
