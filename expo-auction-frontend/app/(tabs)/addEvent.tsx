import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Button } from '@/components/Button';
import { useAppDispatch } from '@/state/hooks';
import { createEvent } from '@/state/slices/eventsSlice';

function nowISO() {
  return new Date().toISOString().slice(0, 16);
}

export default function AddEventScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [startDatetime, setStartDatetime] = useState(nowISO());
  const [endDatetime, setEndDatetime] = useState(nowISO());
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = () => {
    void dispatch(
      createEvent({
        name: name.trim(),
        city: city.trim(),
        state: state.trim(),
        zip_code: zipCode.trim(),
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        created_by: 1, // TODO: use authenticated user id when auth is added
        is_active: isActive,
      })
    ).then((result) => {
      if (createEvent.fulfilled.match(result)) {
        router.back();
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add Auction Event</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Event name"
          placeholderTextColor="#999"
          maxLength={200}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="City"
          placeholderTextColor="#999"
          maxLength={100}
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={state}
          onChangeText={setState}
          placeholder="State (e.g. MA)"
          placeholderTextColor="#999"
          maxLength={50}
        />

        <Text style={styles.label}>Zip code</Text>
        <TextInput
          style={styles.input}
          value={zipCode}
          onChangeText={setZipCode}
          placeholder="Zip code"
          placeholderTextColor="#999"
          maxLength={10}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Start date & time</Text>
        <TextInput
          style={styles.input}
          value={startDatetime}
          onChangeText={setStartDatetime}
          placeholder="YYYY-MM-DDTHH:mm"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>End date & time</Text>
        <TextInput
          style={styles.input}
          value={endDatetime}
          onChangeText={setEndDatetime}
          placeholder="YYYY-MM-DDTHH:mm"
          placeholderTextColor="#999"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Active</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        <Button title="Add Event" onPress={handleSubmit} style={styles.submitButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    marginHorizontal: 0,
  },
});
