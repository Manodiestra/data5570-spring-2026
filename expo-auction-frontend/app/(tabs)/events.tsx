import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';

import type { AuctionEvent } from '@/constants/events';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { displayNameForSub, selectCurrentUser } from '@/state/slices/authSlice';
import {
  fetchEvents,
  selectEvents,
  selectEventsLoading,
  selectEventsError,
} from '@/state/slices/eventsSlice';

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

const EventCard = ({
  event,
  onPress,
  organizerLabel,
}: {
  event: AuctionEvent;
  onPress: () => void;
  organizerLabel: string;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.cardWrapper}>
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {event.name}
        </Text>
        <Text variant="bodyMedium" style={styles.cardLocation}>
          {event.city}, {event.state} {event.zip_code}
        </Text>
        <Text variant="bodySmall" style={styles.cardMeta}>
          Organizer: {organizerLabel}
        </Text>
        <Text variant="bodySmall" style={styles.cardDate}>
          {formatEventDate(event.start_datetime)} – {formatEventDate(event.end_datetime)}
        </Text>
        {!event.is_active && (
          <Text variant="labelMedium" style={styles.cardBadge}>
            Ended
          </Text>
        )}
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

export default function EventsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const events = useAppSelector(selectEvents);
  const loading = useAppSelector(selectEventsLoading);
  const error = useAppSelector(selectEventsError);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(
    () => {
      void dispatch(fetchEvents());
    },
    [dispatch]
  );

  const renderItem: ListRenderItem<AuctionEvent> = ({ item }) => (
    <EventCard
      event={item}
      organizerLabel={displayNameForSub(
        item.created_by_sub,
        currentUser,
        item.created_by_display_name
      )}
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
      {error ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.title}>
                Events
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)/addEvent')}
                compact
              >
                Add
              </Button>
            </View>
          }
        />
      )}
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
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 6,
  },
  cardLocation: {
    color: '#666',
    marginBottom: 4,
  },
  cardMeta: {
    color: '#777',
    marginBottom: 4,
  },
  cardDate: {
    color: '#888',
  },
  cardBadge: {
    marginTop: 8,
    color: '#c00',
  },
  centered: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#c00',
  },
});
