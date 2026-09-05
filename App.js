import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { api, fetchMe, getToken, logout } from './api';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('login');
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await fetchMe();
          setUser(me);
        } catch {
          await logout();
        }
      }
      setBooting(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    api
      .get('/')
      .then((res) => setApiMessage(res.data.message))
      .catch(() => setApiMessage('Failed to reach API'));
  }, [user]);

  async function handleLogout() {
    await logout();
    setUser(null);
    setScreen('login');
  }

  if (booting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return screen === 'login' ? (
      <LoginScreen onLogin={setUser} onGoToRegister={() => setScreen('register')} />
    ) : (
      <RegisterScreen onRegister={setUser} onGoToLogin={() => setScreen('login')} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, {user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.apiMessage}>{apiMessage}</Text>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
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
    padding: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    marginBottom: 16,
  },
  apiMessage: {
    marginBottom: 24,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  logoutText: {
    color: '#d93025',
    fontWeight: '600',
  },
});
