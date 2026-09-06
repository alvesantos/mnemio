import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import StarRating from '../components/StarRating';
import StatusPill from '../components/StatusPill';
import { MEDIA_THEME, STATUS_OPTIONS, useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { progressFor } from '../mediaProgress';
import { API_BY_TYPE } from '../resources';

export default function MediaDetailScreen({ route, navigation }) {
  const { type, id } = route.params;
  const resourceApi = API_BY_TYPE[type];
  const media = MEDIA_THEME[type];
  const progress = progressFor(type);

  const { colors } = useTheme();
  const { showAchievements } = useToast();
  const insets = useSafeAreaInsets();

  const [item, setItem] = useState(route.params.item ?? null);
  const [loading, setLoading] = useState(!route.params.item);
  const [notes, setNotes] = useState(route.params.item?.notes ?? '');
  const [notesDirty, setNotesDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const fresh = await resourceApi.get(id);
      setItem(fresh);
      // Não sobrescreve o que o usuário está digitando.
      setNotes((current) => (notesDirty ? current : fresh.notes ?? ''));
    } catch {
      setError('Não foi possível carregar este item.');
    } finally {
      setLoading(false);
    }
  }, [resourceApi, id, notesDirty]);

  useEffect(() => {
    load();
    // Recarrega só ao montar; edições feitas aqui já atualizam o estado local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: item?.title ?? media.label });
  }, [navigation, item, media.label]);

  async function patch(payload) {
    setSaving(true);
    setError(null);
    try {
      const updated = await resourceApi.update(id, payload);
      setItem(updated);
      showAchievements(updated.unlocked_achievements);
      return updated;
    } catch {
      setError('Não foi possível salvar.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    const updated = await patch({ notes: notes.trim() === '' ? null : notes.trim() });
    if (updated) setNotesDirty(false);
  }

  function handleDelete() {
    Alert.alert(
      `Excluir ${media.label.toLowerCase()}`,
      `Tem certeza que quer excluir "${item.title}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await resourceApi.remove(id);
            navigation.goBack();
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

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>{error ?? 'Item não encontrado.'}</Text>
      </View>
    );
  }

  const isFinished = item.status === 'finalizado';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={media.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Ionicons name={media.icon} size={110} color="rgba(255,255,255,0.16)" style={styles.heroGhost} />
          <View style={styles.heroBadge}>
            <Ionicons name={media.icon} size={18} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{item.title}</Text>
          <Text style={styles.heroType}>{media.label}</Text>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.heading }]}>Status</Text>
            <StatusPill status={item.status} size="sm" />
          </View>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((option) => {
              const active = option.value === item.status;
              return (
                <Pressable
                  key={option.value}
                  disabled={saving}
                  onPress={() => patch({ status: option.value })}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: active ? colors.heading : colors.surface,
                      borderColor: active ? colors.heading : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: active ? colors.background : colors.textMuted },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {progress && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.heading }]}>Progresso</Text>
            <ProgressBar
              current={item[progress.current]}
              total={item[progress.total]}
              label={progress.label}
              color={media.gradient[0]}
            />
            {!isFinished && (
              <View style={styles.stepper}>
                <Pressable
                  disabled={saving || (item[progress.current] ?? 0) === 0}
                  onPress={() =>
                    patch({ [progress.current]: Math.max((item[progress.current] ?? 0) - 1, 0) })
                  }
                  style={[styles.stepButton, { backgroundColor: colors.surfaceAlt }]}
                >
                  <Ionicons name="remove" size={18} color={colors.heading} />
                </Pressable>
                <Pressable
                  disabled={saving}
                  onPress={() => patch({ [progress.current]: (item[progress.current] ?? 0) + 1 })}
                  style={[styles.stepButton, { backgroundColor: colors.surfaceAlt }]}
                >
                  <Ionicons name="add" size={18} color={colors.heading} />
                </Pressable>
                <Pressable
                  disabled={saving}
                  onPress={() => patch({ [progress.current]: (item[progress.current] ?? 0) + 10 })}
                  style={[styles.stepButtonWide, { backgroundColor: colors.surfaceAlt }]}
                >
                  <Text style={[styles.stepText, { color: colors.heading }]}>+10</Text>
                </Pressable>
              </View>
            )}
            {progress.extra && (
              <Text style={[styles.extraLine, { color: colors.textMuted }]}>
                {progress.extra.label}: {item[progress.extra.field] ?? 0}
              </Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.heading }]}>Sua nota</Text>
          <StarRating value={item.rating} onChange={(value) => patch({ rating: value })} size={30} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.heading }]}>Anotações</Text>
            {notesDirty && (
              <Pressable onPress={saveNotes} disabled={saving}>
                <Text style={[styles.saveNotes, { color: colors.accent }]}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Text>
              </Pressable>
            )}
          </View>
          <TextInput
            style={[
              styles.textArea,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="O que você gostou? O que não gostou? Escreva o que quiser."
            placeholderTextColor={colors.textFaint}
            value={notes}
            onChangeText={(text) => {
              setNotes(text);
              setNotesDirty(true);
            }}
            onBlur={() => notesDirty && saveNotes()}
            multiline
            textAlignVertical="top"
          />
        </View>

        {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

        <View style={styles.footer}>
          <Pressable
            style={[styles.footerButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate(route.params.editRoute, { type, item })}
          >
            <Ionicons name="create-outline" size={17} color={colors.heading} />
            <Text style={[styles.footerText, { color: colors.heading }]}>Editar tudo</Text>
          </Pressable>
          <Pressable
            style={[styles.footerButton, { borderColor: colors.border }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
            <Text style={[styles.footerText, { color: colors.danger }]}>Excluir</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 26 },
  hero: {
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
  },
  heroGhost: {
    position: 'absolute',
    right: -18,
    bottom: -22,
    transform: [{ rotate: '-12deg' }],
  },
  heroBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  heroType: {
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
  },
  section: { gap: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  statusText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    gap: 8,
  },
  stepButton: {
    width: 46,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonWide: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '700',
  },
  extraLine: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveNotes: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 140,
    fontSize: 15,
    lineHeight: 21,
  },
  error: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
