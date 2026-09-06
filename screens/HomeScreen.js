import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { animesApi, filmesApi, livrosApi, seriesApi } from '../resources';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const COLLECTIONS = [
  { key: 'livros', label: 'Livros', api: livrosApi, tab: 'Livros' },
  { key: 'series', label: 'Séries', api: seriesApi, tab: 'Mídias' },
  { key: 'filmes', label: 'Filmes', api: filmesApi, tab: 'Mídias' },
  { key: 'animes', label: 'Animes', api: animesApi, tab: 'Mídias' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const insets = useSafeAreaInsets();

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
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
    >
      <Text style={styles.greeting}>{getGreeting()},</Text>
      <Text style={styles.name}>{user?.name}</Text>

      <Text style={styles.sectionTitle}>Suas coleções</Text>
      <View style={styles.grid}>
        {COLLECTIONS.map((collection) => (
          <Pressable
            key={collection.key}
            style={styles.card}
            onPress={() => navigation.navigate(collection.tab)}
          >
            <Text style={styles.cardCount}>{counts[collection.key] ?? '–'}</Text>
            <Text style={styles.cardLabel}>{collection.label}</Text>
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
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1f3d',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f1f1f',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#f7f7f8',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  cardCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1f3d',
  },
  cardLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
