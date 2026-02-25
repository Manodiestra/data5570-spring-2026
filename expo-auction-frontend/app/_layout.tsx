import { Provider } from 'react-redux';
import { Stack } from 'expo-router';

import { store } from '@/state/slices/store';

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: true }} />
    </Provider>
  );
}
