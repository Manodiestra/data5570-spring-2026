import { configureStore } from '@reduxjs/toolkit';

import auctionItemsReducer from './auctionItemsSlice';
import eventsReducer from './eventsSlice';

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    auctionItems: auctionItemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
