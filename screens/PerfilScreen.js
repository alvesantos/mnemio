import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
      <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>

      <Pressable
        style={[styles.settingsButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={18} color={colors.text} style={styles.settingsIcon} />
        <Text style={[styles.settingsText, { color: colors.text }]}>Configurações</Text>
      </Pressable>

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
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  settingsIcon: {
    marginRight: 8,
  },
  settingsText: {
    fontWeight: '600',
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
