import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { animesApi, filmesApi, livrosApi, seriesApi } from '../resources';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const COLLECTIONS = [
  {
    key: 'livros',
    label: 'Livros',
    api: livrosApi,
    tab: 'Livros',
    icon: 'book',
    gradient: ['#7C6CFF', '#4B36D9'],
  },
  {
    key: 'series',
    label: 'Séries',
    api: seriesApi,
    tab: 'Mídias',
    icon: 'tv',
    gradient: ['#12D6C4', '#0C8F91'],
  },
  {
    key: 'filmes',
    label: 'Filmes',
    api: filmesApi,
    tab: 'Mídias',
    icon: 'film',
    gradient: ['#FF7A7A', '#D93D5A'],
  },
  {
    key: 'animes',
    label: 'Animes',
    api: animesApi,
    tab: 'Mídias',
    icon: 'sparkles',
    gradient: ['#FFB84D', '#F76B1C'],
  },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const insets = useSafeAreaInsets();
  const { mode, colors } = useTheme();

  const hasLoaded = Object.keys(counts).length === COLLECTIONS.length;
  const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const isEmpty = hasLoaded && totalItems === 0;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all(COLLECTIONS.map((collection) => collection.api.list())).then((results) => {
        if (cancelled) return;
        const next = {};
        COLLECTIONS.forEach((collection, index) => {
          next[collection.key] = results[index].length;
        });
        setCounts(next);
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()},</Text>
          <Text style={[styles.name, { color: colors.heading }]}>{user?.name}</Text>
        </View>
        <Image
          source={
            mode === 'dark'
              ? require('../assets/icons/mn_mnemio_logo_light.webp')
              : require('../assets/icons/mn_mnemio_logo_dark.webp')
          }
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {isEmpty && (
        <View style={[styles.continueCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="compass-outline" size={22} color={colors.heading} />
          <View style={styles.continueTextWrap}>
            <Text style={[styles.continueTitle, { color: colors.text }]}>Continue de onde parou</Text>
            <Text style={[styles.continueSubtitle, { color: colors.textMuted }]}>
              Parece que você ainda não adicionou nada por aqui. Que tal começar sua coleção agora?
            </Text>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Suas coleções</Text>
      <View style={styles.grid}>
        {COLLECTIONS.map((collection) => (
          <Pressable
            key={collection.key}
            style={({ pressed }) => [styles.cardShadow, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate(collection.tab)}
          >
            <LinearGradient
              colors={collection.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <Ionicons
                name={collection.icon}
                size={88}
                color="rgba(255,255,255,0.16)"
                style={styles.cardGhostIcon}
              />
              <View style={styles.cardBadge}>
                <Ionicons name={collection.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.cardCount}>{counts[collection.key] ?? '–'}</Text>
              <Text style={styles.cardLabel}>{collection.label}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1f3d',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 12,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  continueTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  continueSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '100%',
    minHeight: 140,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  cardShadow: {
    width: '47%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardGhostIcon: {
    position: 'absolute',
    right: -14,
    bottom: -14,
    transform: [{ rotate: '-12deg' }],
  },
  cardBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 20,
  },
  cardCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
