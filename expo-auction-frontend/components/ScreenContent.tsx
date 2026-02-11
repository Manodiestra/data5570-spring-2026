import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import EditScreenInfo from './EditScreenInfo';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {

  const myFunction = (name: string) => {
    return `"Hello, ${name}!"`;

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>{myFunction('John')}</Text>
      <View style={styles.separator} />
      <EditScreenInfo path={path} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'left',
    padding: 50,
    margin: 100,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    backgroundColor: '#d1d5db',
    height: 1,
    marginVertical: 30,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
