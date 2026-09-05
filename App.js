import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import LoginScreen from './screens/LoginScreen';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    if (!user) return;
    axios
      .get(API_URL + '/')
      .then((response) => setMessage(response.data.message))
      .catch(() => setMessage('Failed to reach API'));
  }, [user]);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <View style={styles.container}>
      <Text>Olá, {user.name || user.email}</Text>
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
