import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme } from 'react-native-paper';

import { useAppDispatch, useAppSelector } from '@/state/hooks';
import {
  fetchAuctionItems,
  selectAuctionItems,
  selectAuctionItemsError,
  selectAuctionItemsLoading,
} from '@/state/slices/auctionItemsSlice';

export default function ItemsScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const items = useAppSelector(selectAuctionItems);
  const loading = useAppSelector(selectAuctionItemsLoading);
  const error = useAppSelector(selectAuctionItemsError);

  useEffect(() => {
    void dispatch(fetchAuctionItems());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Items
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>No items yet.</Text>
      ) : (
        items.slice(0, 30).map((item) => (
          <Card key={String(item.id)} style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall" style={styles.meta}>
                ${item.current_price.toFixed(2)} · {item.status}
              </Text>
              <Text variant="bodyMedium" numberOfLines={2}>
                {item.description}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  meta: {
    color: '#666',
    marginTop: 6,
    marginBottom: 8,
  },
  errorText: {
    color: '#c00',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

