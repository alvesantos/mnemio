import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import StarRating from './StarRating';

export default function CollectionListScreen({
  resourceApi,
  itemLabel,
  emptyLabel,
  onAddPress,
  onEditPress,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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

  function handleDelete(item) {
    Alert.alert(
      `Excluir ${itemLabel.toLowerCase()}`,
      `Tem certeza que quer excluir "${item.title}"?`,
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
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={items.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={<Text style={styles.empty}>{emptyLabel}</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => onEditPress(item)}>
            <View style={styles.rowMain}>
              <Text style={styles.title}>{item.title}</Text>
              <StarRating value={item.rating} readOnly size={14} />
            </View>
            <Pressable
              onPress={() => handleDelete(item)}
              hitSlop={8}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Excluir</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={onAddPress}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: '#999',
    fontSize: 14,
  },
  error: {
    color: '#d93025',
    fontSize: 13,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f1f1f',
  },
  deleteButton: {
    marginLeft: 12,
  },
  deleteText: {
    color: '#d93025',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1f3d',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
  },
});
