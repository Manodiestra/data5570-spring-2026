import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

import type { AuctionEvent } from '@/constants/events';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function EventItemScreen() {
  const { eventJson } = useLocalSearchParams<{ id: string; eventJson?: string }>();
  let event: AuctionEvent | null = null;
  if (eventJson) {
    try {
      event = JSON.parse(eventJson) as AuctionEvent;
    } catch {
      event = null;
    }
  }

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
        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>{formatDateTime(event.created_at)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Updated</Text>
        <Text style={styles.value}>{formatDateTime(event.updated_at)}</Text>
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
});
