import { useState } from 'react';
import { Stack } from 'expo-router';

import { StyleSheet, View, Text, TextInput, ScrollView } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    console.log('Sign in button pressed');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sign In' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Container>
          <View style={styles.signInContainer}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back! Please sign in to continue.</Text>
            
            <View style={styles.formContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
              
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
              />
              
              <Button 
                title="Sign In" 
                onPress={handleSignIn}
                style={styles.signInButton}
              />
            </View>
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  signInContainer: {
    width: '100%',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  signInButton: {
    marginTop: 24,
    marginHorizontal: 0,
  },
});
