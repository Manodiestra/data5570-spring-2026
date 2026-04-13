import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput, useTheme } from 'react-native-paper';

import type { AuctionItem } from '@/constants/auctionItems';
import { createCheckoutSession, fetchAuctionItemById } from '@/services/paymentsApi';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { selectAccessToken } from '@/state/slices/authSlice';
import { fetchAuctionItems, selectAuctionItemById } from '@/state/slices/auctionItemsSlice';

function parseDetailMessage(raw: string): string {
  try {
    const j = JSON.parse(raw) as { detail?: unknown };
    if (typeof j.detail === 'string') {
      return j.detail;
    }
  } catch {
    /* ignore */
  }
  return raw;
}

export default function ItemCheckoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { itemId: itemIdParam } = useLocalSearchParams<{ itemId: string }>();
  const itemId = Number(itemIdParam);
  const token = useAppSelector(selectAccessToken);

  const itemFromStore = useAppSelector((state) => {
    if (!Number.isFinite(itemId)) return undefined;
    return selectAuctionItemById(itemId)(state);
  });

  const [item, setItem] = useState<AuctionItem | null | undefined>(itemFromStore);
  const [email, setEmail] = useState('');
  const [loadingItem, setLoadingItem] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(itemId)) {
      setItem(null);
      return;
    }
    if (itemFromStore) {
      setItem(itemFromStore);
      return;
    }
    let cancelled = false;
    setLoadingItem(true);
    void fetchAuctionItemById(itemId).then((row) => {
      if (cancelled) return;
      setItem(row);
      setLoadingItem(false);
      if (!row) {
        void dispatch(fetchAuctionItems());
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch, itemFromStore, itemId]);

  const onPay = useCallback(async () => {
    if (!item || !Number.isFinite(itemId)) return;
    setError(null);
    setCheckoutLoading(true);
    try {
      const { checkout_url } = await createCheckoutSession({
        auctionItemId: item.id,
        customerEmail: email.trim() || undefined,
        accessToken: token,
      });
      await WebBrowser.openBrowserAsync(checkout_url);
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(parseDetailMessage(raw));
    } finally {
      setCheckoutLoading(false);
    }
  }, [email, item, itemId, token]);

  if (!Number.isFinite(itemId)) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge">Invalid item.</Text>
        <Button onPress={() => router.back()}>Go back</Button>
      </View>
    );
  }

  if (loadingItem || item === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.errorText}>
          Item not found.
        </Text>
        <Button onPress={() => router.back()}>Go back</Button>
      </View>
    );
  }

  const canPay = item.status === 'published';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        Checkout (Stripe test)
      </Text>
      <Text variant="titleMedium" style={styles.itemName}>
        {item.name}
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        {item.description}
      </Text>
      <Text variant="titleLarge" style={styles.price}>
        ${item.current_price.toFixed(2)} USD
      </Text>
      <Text variant="bodySmall" style={styles.meta}>
        Status: {item.status}
        {item.auction_event_name ? ` · Event: ${item.auction_event_name}` : ''}
      </Text>

      {!canPay ? (
        <Text variant="bodyMedium" style={styles.warn}>
          This item is not available for purchase.
        </Text>
      ) : (
        <>
          <Text variant="labelLarge" style={styles.label}>
            Email (optional)
          </Text>
          <TextInput
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="prefill@example.com"
            style={styles.input}
          />
          <Text variant="bodySmall" style={styles.hint}>
            Opens Stripe Checkout in the browser. Use test card 4242 4242 4242 4242 with any future
            expiry and CVC.
          </Text>
        </>
      )}

      {error ? (
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => router.back()} disabled={checkoutLoading}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={() => void onPay()}
          loading={checkoutLoading}
          disabled={!canPay || checkoutLoading}>
          Pay with Stripe
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 16,
  },
  itemName: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    color: '#444',
    lineHeight: 22,
  },
  price: {
    marginBottom: 8,
  },
  meta: {
    color: '#666',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  hint: {
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  warn: {
    color: '#a60',
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginTop: 8,
  },
});
