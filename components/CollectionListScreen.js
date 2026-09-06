import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MEDIA_THEME, STATUS_OPTIONS, useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { progressFor } from '../mediaProgress';
import MediaCard from './MediaCard';

const FILTERS = [{ value: 'todos', label: 'Todos' }, ...STATUS_OPTIONS];

export default function CollectionListScreen({
  type,
  resourceApi,
  itemLabel,
  emptyLabel,
  onAddPress,
  onEditPress,
  onDetailPress,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showAchievements } = useToast();
  const media = MEDIA_THEME[type];
  const progress = progressFor(type);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await resourceApi.list());
    } catch {
      setError(`Não foi possível carregar seus ${itemLabel.toLowerCase()}s.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resourceApi, itemLabel]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(
    () => (filter === 'todos' ? items : items.filter((item) => item.status === filter)),
    [items, filter]
  );

  const counts = useMemo(() => {
    const result = { todos: items.length };
    STATUS_OPTIONS.forEach((option) => {
      result[option.value] = items.filter((item) => item.status === option.value).length;
    });
    return result;
  }, [items]);

  function replaceItem(updated) {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function patch(item, payload) {
    setBusyId(item.id);
    try {
      const updated = await resourceApi.update(item.id, payload);
      replaceItem(updated);
      showAchievements(updated.unlocked_achievements);
    } catch {
      setError('Não foi possível salvar a alteração.');
    } finally {
      setBusyId(null);
    }
  }

  function handleDelete(item) {
    Alert.alert(
      `Excluir ${itemLabel.toLowerCase()}`,
      `Tem certeza que quer excluir "${item.title}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await resourceApi.remove(item.id);
            setItems((current) => current.filter((existing) => existing.id !== item.id));
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.heading} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersWrap}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((option) => {
          const active = option.value === filter;
          return (
            <Pressable
              key={option.value}
              onPress={() => setFilter(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.heading : colors.surface,
                  borderColor: active ? colors.heading : colors.border,
                },
              ]}
            >
              <Text
                style={[styles.chipText, { color: active ? colors.background : colors.textMuted }]}
              >
                {option.label} {counts[option.value] ?? 0}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 110 },
          visible.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.heading}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name={media.icon} size={44} color={colors.textFaint} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {filter === 'todos' ? emptyLabel : 'Nada com esse status por aqui.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MediaCard
            item={item}
            type={type}
            expanded={expandedId === item.id}
            busy={busyId === item.id}
            onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onOpenDetail={() => onDetailPress(item)}
            onEdit={() => onEditPress(item)}
            onDelete={() => handleDelete(item)}
            onQuickProgress={(amount) =>
              patch(item, { [progress.current]: (item[progress.current] ?? 0) + amount })
            }
            onQuickFinish={() => patch(item, { status: 'finalizado' })}
          />
        )}
      />

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 96, backgroundColor: colors.heading }]}
        onPress={onAddPress}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // flexGrow 0 impede o ScrollView de ocupar a sobra vertical do container
  // flex:1; alignItems center impede os chips de esticarem na altura, que e
  // o padrao (stretch) num ScrollView horizontal.
  filtersWrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  error: {
    fontSize: 13,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
