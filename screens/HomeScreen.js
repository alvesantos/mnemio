import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { MEDIA_THEME, useTheme } from '../context/ThemeContext';
import {
  animesApi,
  doramasApi,
  fetchContinue,
  fetchStats,
  filmesApi,
  livrosApi,
  seriesApi,
} from '../resources';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

const COLLECTIONS = [
  { key: 'livros', api: livrosApi, tab: 'Livros' },
  { key: 'series', api: seriesApi, tab: 'Mídias' },
  { key: 'filmes', api: filmesApi, tab: 'Mídias' },
  { key: 'doramas', api: doramasApi, tab: 'Mídias' },
  { key: 'animes', api: animesApi, tab: 'Mídias' },
];

// Cada tipo mora numa aba e numa rota de detalhe diferente.
const DETAIL_ROUTE = {
  livros: { tab: 'Livros', screen: 'LivroDetail', editRoute: 'LivroForm' },
  series: { tab: 'Mídias', screen: 'MidiaDetail', editRoute: 'MidiaForm' },
  filmes: { tab: 'Mídias', screen: 'MidiaDetail', editRoute: 'MidiaForm' },
  doramas: { tab: 'Mídias', screen: 'MidiaDetail', editRoute: 'MidiaForm' },
  animes: { tab: 'Mídias', screen: 'MidiaDetail', editRoute: 'MidiaForm' },
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [continueItems, setContinueItems] = useState([]);
  const [streak, setStreak] = useState(0);
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

      fetchContinue()
        .then((items) => !cancelled && setContinueItems(items))
        .catch(() => {});

      fetchStats()
        .then((stats) => !cancelled && setStreak(stats.streak_count))
        .catch(() => {});

      return () => {
        cancelled = true;
      };
    }, [])
  );

  function openItem(item) {
    const route = DETAIL_ROUTE[item.type];
    navigation.navigate(route.tab, {
      screen: route.screen,
      params: { type: item.type, id: item.id, editRoute: route.editRoute },
    });
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()},</Text>
          <Text style={[styles.name, { color: colors.heading }]}>{user?.name}</Text>
          {streak > 0 && (
            <View style={[styles.streak, { backgroundColor: `${colors.accent}26` }]}>
              <Ionicons name="flame" size={13} color={colors.accent} />
              <Text style={[styles.streakText, { color: colors.accent }]}>
                {streak} {streak === 1 ? 'dia seguido' : 'dias seguidos'}
              </Text>
            </View>
          )}
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
        <View
          style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="compass-outline" size={22} color={colors.heading} />
          <View style={styles.emptyTextWrap}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Comece sua coleção</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Você ainda não adicionou nada. Escolha uma coleção abaixo e registre a primeira obra.
            </Text>
          </View>
        </View>
      )}

      {continueItems.length > 0 && (
        <View style={styles.continueSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Continue de onde você parou
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.continueRow}
          >
            {continueItems.map((item) => {
              const media = MEDIA_THEME[item.type];
              return (
                <Pressable
                  key={`${item.type}-${item.id}`}
                  onPress={() => openItem(item)}
                  style={({ pressed }) => [
                    styles.continueCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowOpacity: colors.shadowOpacity,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.continueHead}>
                    <LinearGradient
                      colors={media.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.continueBadge}
                    >
                      <Ionicons name={media.icon} size={15} color="#fff" />
                    </LinearGradient>
                    <Text style={[styles.continueType, { color: colors.textFaint }]}>
                      {media.label}
                    </Text>
                  </View>
                  <Text
                    style={[styles.continueTitle, { color: colors.heading }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  {item.progress_label && (
                    <ProgressBar
                      current={item.progress_current}
                      total={item.progress_total}
                      label={item.progress_label}
                      color={media.gradient[0]}
                      compact
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Suas coleções</Text>
      <View style={styles.grid}>
        {COLLECTIONS.map((collection) => {
          const media = MEDIA_THEME[collection.key];
          return (
            <Pressable
              key={collection.key}
              style={({ pressed }) => [styles.cardShadow, pressed && styles.pressed]}
              onPress={() => navigation.navigate(collection.tab)}
            >
              <LinearGradient
                colors={media.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Ionicons
                  name={media.icon}
                  size={88}
                  color="rgba(255,255,255,0.16)"
                  style={styles.cardGhostIcon}
                />
                <View style={styles.cardBadge}>
                  <Ionicons name={media.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.cardCount}>{counts[collection.key] ?? '–'}</Text>
                <Text style={styles.cardLabel}>{media.plural}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerText: {
    flex: 1,
    gap: 2,
  },
  logo: {
    width: 72,
    height: 72,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  emptyTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  continueSection: {
    marginBottom: 26,
  },
  continueRow: {
    gap: 12,
    paddingRight: 4,
  },
  continueCard: {
    width: 190,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  continueHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueType: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  continueTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    minHeight: 38,
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
  pressed: {
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
