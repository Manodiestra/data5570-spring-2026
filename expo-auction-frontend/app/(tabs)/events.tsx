import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';

import type { AuctionEvent } from '@/constants/events';
import { useAppSelector } from '@/state/hooks';
import { selectEvents } from '@/state/slices/eventsSlice';

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const EventCard = ({ event, onPress }: { event: AuctionEvent; onPress: () => void }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.cardTitle}>{event.name}</Text>
    <Text style={styles.cardLocation}>
      {event.city}, {event.state} {event.zip_code}
    </Text>
    <Text style={styles.cardDate}>
      {formatEventDate(event.start_datetime)} – {formatEventDate(event.end_datetime)}
    </Text>
    {!event.is_active && (
      <Text style={styles.cardBadge}>Ended</Text>
    )}
  </TouchableOpacity>
);

export default function EventsScreen() {
  const router = useRouter();
  const events = useAppSelector(selectEvents);

  const renderItem: ListRenderItem<AuctionEvent> = ({ item }) => (
    <EventCard
      event={item}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/event/[id]',
          params: { id: String(item.id), eventJson: JSON.stringify(item) },
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Events</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/addEvent')}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: '#888',
  },
  cardBadge: {
    marginTop: 8,
    fontSize: 12,
    color: '#c00',
    fontWeight: '600',
  },
});
