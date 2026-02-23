import { Tabs } from 'expo-router';

export default function AuthTabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sign In',
        }}
      />
      <Tabs.Screen
        name="sign-up"
        options={{
          title: 'Sign Up',
        }}
      />
    </Tabs>
  );
}
