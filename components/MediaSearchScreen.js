import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MEDIA_THEME, useTheme } from '../context/ThemeContext';
import { fetchMediaItem, searchMedia } from '../resources';

// Uma request por pausa da digitação, não por tecla: segura o rate limit das
// fontes (o Google Books é o mais apertado) e o gasto de rede do aparelho.
const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

function keyFor(item) {
  return `${item.source}:${item.external_id}`;
}

/**
 * Busca um item nas fontes externas e devolve o escolhido para o formulário.
 *
 * `onPick(prefill)` recebe { title, media_ref, poster_url, ... } já pronto para
 * preencher o cadastro; `onManual()` é a saída quando a fonte não tem o item.
 */
export default function MediaSearchScreen({ type, onPick, onManual }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const media = MEDIA_THEME[type];

  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [pickingKey, setPickingKey] = useState(null);
  const [searched, setSearched] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    const query = term.trim();

    if (query.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      setResults([]);
      setDegraded(false);
      setLoading(false);
      setSearched(false);
      return undefined;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      // Cancela a busca anterior: só o resultado da digitação atual interessa.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await searchMedia({ type, query, signal: controller.signal });
        setResults(response.results);
        setDegraded(response.degraded);
        setSearched(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        // Busca que falha vira lista vazia com aviso, nunca alerta de erro.
        setResults([]);
        setDegraded(true);
        setSearched(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [term, type]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handlePick = useCallback(
    async (item) => {
      Keyboard.dismiss();
      setPickingKey(keyFor(item));

      // Abrir o detalhe é o que faz o backend guardar o item no catálogo.
      // Se a chamada falhar, o cadastro segue com o que veio da busca.
      let detail = item;
      try {
        detail = await fetchMediaItem({
          type,
          source: item.source,
          externalId: item.external_id,
        });
      } catch {
        detail = item;
      } finally {
        setPickingKey(null);
      }

      onPick({
        title: detail.title,
        poster_url: detail.poster_url,
        release_year: detail.release_year,
        original_title: detail.original_title,
        synopsis: detail.synopsis,
        media_ref: { source: item.source, external_id: item.external_id },
      });
    },
    [onPick, type]
  );

  function renderItem({ item }) {
    const busy = pickingKey === keyFor(item);
    return (
      <Pressable
        style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handlePick(item)}
        disabled={busy}
      >
        {item.poster_url ? (
          <Image source={{ uri: item.poster_url }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={[styles.poster, styles.posterEmpty, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name={media.icon} size={20} color={colors.textFaint} />
          </View>
        )}

        <View style={styles.rowText}>
          <Text style={[styles.title, { color: colors.heading }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.original_title ? (
            <Text style={[styles.subtitle, { color: colors.textFaint }]} numberOfLines={1}>
              {item.original_title}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.release_year ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.release_year}</Text>
            ) : null}
            {item.cached ? (
              <View style={[styles.badge, { backgroundColor: `${colors.accent}2A` }]}>
                <Text style={[styles.badgeText, { color: colors.accent }]}>no catálogo</Text>
              </View>
            ) : null}
          </View>
        </View>

        {busy ? (
          <ActivityIndicator color={colors.heading} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        )}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={`Buscar ${media.plural.toLowerCase()}...`}
          placeholderTextColor={colors.textFaint}
          value={term}
          onChangeText={setTerm}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator color={colors.textFaint} /> : null}
        {!loading && term.length > 0 ? (
          <Pressable onPress={() => setTerm('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {degraded ? (
        <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="cloud-offline-outline" size={15} color={colors.textMuted} />
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>
            Resultados limitados — a busca externa está indisponível agora.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={keyFor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={searched ? 'sad-outline' : 'search'}
              size={40}
              color={colors.textFaint}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searched
                ? 'Nada encontrado com esse nome.'
                : `Digite pra buscar entre os ${media.plural.toLowerCase()}.`}
            </Text>
          </View>
        }
      />

      <Pressable
        style={[styles.manual, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={onManual}
      >
        <Ionicons name="create-outline" size={17} color={colors.heading} />
        <Text style={[styles.manualText, { color: colors.heading }]}>
          Não encontrou? Cadastrar manualmente
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    padding: 0,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 10,
    borderRadius: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 14,
  },
  poster: {
    width: 46,
    height: 68,
    borderRadius: 8,
  },
  posterEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13.5,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  manual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    marginTop: 0,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  manualText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
