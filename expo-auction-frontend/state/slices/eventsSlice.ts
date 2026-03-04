import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { AuctionEvent } from '@/constants/events';

const API_BASE = 'http://localhost:8000/api';

type EventsState = {
  items: AuctionEvent[];
  loading: boolean;
  error: string | null;
};

const initialState: EventsState = {
  items: [],
  loading: false,
  error: null,
};

/** Payload for creating an event (POST). Omits server-set fields. */
export type CreateEventPayload = {
  name: string;
  city: string;
  state: string;
  zip_code: string;
  start_datetime: string;
  end_datetime: string;
  created_by: number;
  is_active?: boolean;
};

export const fetchEvents = createAsyncThunk<
  AuctionEvent[],
  void,
  { rejectValue: string }
>(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auctionEvent/`);
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return data as AuctionEvent[];
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch events';
      console.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createEvent = createAsyncThunk<
  AuctionEvent,
  CreateEventPayload,
  { rejectValue: string }
>(
  'events/createEvent',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/auctionEvent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          is_active: payload.is_active ?? true,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        return rejectWithValue(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return data as AuctionEvent;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create event';
      return rejectWithValue(message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: { payload: AuctionEvent[] }) => {
      state.items = action.payload;
      state.error = null;
    },
    addEvent: (state, action: { payload: AuctionEvent }) => {
      state.items.push(action.payload);
      state.error = null;
    },
    clearEventsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchEvents
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch events';
      });
    // createEvent
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create event';
      });
  },
});

export const { setEvents, addEvent, clearEventsError } = eventsSlice.actions;

export const selectEvents = (state: { events: EventsState }): AuctionEvent[] =>
  state.events.items;

export const selectEventsLoading = (state: {
  events: EventsState;
}): boolean => state.events.loading;

export const selectEventsError = (state: {
  events: EventsState;
}): string | null => state.events.error;

export default eventsSlice.reducer;
