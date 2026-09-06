import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 100 }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
      <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a1f3d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  email: {
    color: '#666',
    marginTop: 4,
    marginBottom: 32,
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
