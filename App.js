import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    axios
      .get(API_URL + '/')
      .then((response) => setMessage(response.data.message))
      .catch(() => setMessage('Failed to reach API'));
  }, []);

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
