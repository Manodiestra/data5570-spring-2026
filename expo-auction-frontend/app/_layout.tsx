import 'react-native-get-random-values';

import { Provider } from 'react-redux';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

import { store } from '@/state/slices/store';

export default function Layout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: true }}>
          {/* Hide root stack chrome for grouped routes (otherwise titles show as "(tabs)" / "(auth)"). */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </Provider>
  );
}
