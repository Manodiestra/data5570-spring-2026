import { StyleSheet, Text, View } from 'react-native';

export default function ItemsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
