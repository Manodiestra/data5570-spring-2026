import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

import type { AuctionItem } from '@/constants/auctionItems';
import type { AuctionEvent } from '@/constants/events';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { displayNameForSub, selectCurrentUser } from '@/state/slices/authSlice';
import { fetchAuctionItems, selectAuctionItemsByEventId } from '@/state/slices/auctionItemsSlice';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function ItemCard({
  item,
  ownerLabel,
  onBuy,
}: {
  item: AuctionItem;
  ownerLabel: string;
  onBuy: () => void;
}) {
  const descriptionSnippet =
    item.description.length > 80 ? `${item.description.slice(0, 80)}…` : item.description;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSeller}>Seller: {ownerLabel}</Text>
      <Text style={styles.cardDescription}>{descriptionSnippet}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardPrice}>
          ${item.current_price.toFixed(2)} {item.current_price > item.starting_price && '(current)'}
        </Text>
        <Text style={styles.cardStatus}>{item.status}</Text>
      </View>
      {item.status === 'published' ? (
        <Button mode="contained" compact onPress={onBuy} style={styles.buyButton}>
          Buy
        </Button>
      ) : null}
    </View>
  );
}

export default function EventItemScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { eventJson } = useLocalSearchParams<{ id: string; eventJson?: string }>();
  let event: AuctionEvent | null = null;
  if (eventJson) {
    try {
      event = JSON.parse(eventJson) as AuctionEvent;
    } catch {
      event = null;
    }
  }

  const itemsForEvent = useAppSelector(selectAuctionItemsByEventId(event?.id ?? 0));
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    void dispatch(fetchAuctionItems());
  }, [dispatch]);

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Event not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{event.name}</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>
          {event.city}, {event.state} {event.zip_code}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Starts</Text>
        <Text style={styles.value}>{formatDateTime(event.start_datetime)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Ends</Text>
        <Text style={styles.value}>{formatDateTime(event.end_datetime)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{event.is_active ? 'Active' : 'Ended'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Organizer</Text>
        <Text style={styles.value}>
          {displayNameForSub(event.created_by_sub, currentUser, event.created_by_display_name)}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>{formatDateTime(event.created_at)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Updated</Text>
        <Text style={styles.value}>{formatDateTime(event.updated_at)}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Auction items</Text>
          <Button
            mode="contained"
            compact
            onPress={() =>
              router.push({
                pathname: '/(tabs)/addItem',
                params: { eventId: String(event.id) },
              })
            }>
            Add
          </Button>
        </View>
        {itemsForEvent.length === 0 ? (
          <Text style={styles.emptyItems}>No items in this auction yet.</Text>
        ) : (
          itemsForEvent.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              ownerLabel={displayNameForSub(item.owner_sub, currentUser, item.owner_display_name)}
              onBuy={() =>
                router.push({
                  pathname: '/(tabs)/itemCheckout/[itemId]',
                  params: { itemId: String(item.id) },
                })
              }
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
  error: {
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyItems: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },
  cardSeller: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'capitalize',
  },
  buyButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
