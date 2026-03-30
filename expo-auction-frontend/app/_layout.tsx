import 'react-native-get-random-values';

import { Provider } from 'react-redux';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

import { store } from '@/state/slices/store';

export default function Layout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: true }} />
      </PaperProvider>
    </Provider>
  );
}
