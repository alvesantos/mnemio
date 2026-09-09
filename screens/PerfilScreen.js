import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchStats } from '../resources';

// Conquistas de tipos de mídia que o app não exibe mais. O backend continua
// contando (os dados seguem lá), mas mostrar "Finalize 10 animes" numa versão
// sem animes só confunde.
const HIDDEN_ACHIEVEMENTS = ['otaku'];

const THEME_OPTIONS = [
  { key: 'light', label: 'Claro', icon: 'sunny' },
  { key: 'dark', label: 'Escuro', icon: 'moon' },
];

function ThemeSwitch({ mode, setTheme, colors }) {
  return (
    <View style={[styles.themeSwitch, { backgroundColor: colors.surfaceAlt }]}>
      {THEME_OPTIONS.map((option) => {
        const selected = option.key === mode;
        return (
          <Pressable
            key={option.key}
            style={[
              styles.themeOption,
              selected && { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setTheme(option.key)}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={selected ? colors.heading : colors.textFaint}
            />
            <Text
              style={[
                styles.themeLabel,
                { color: selected ? colors.heading : colors.textFaint },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PaletteSwitch({ palette, palettes, setPalette, colors }) {
  return (
    <View style={styles.paletteRow}>
      {palettes.map((option) => {
        const selected = option.key === palette;
        const [ink, accent] = option.swatch;
        return (
          <Pressable
            key={option.key}
            style={[
              styles.paletteOption,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: selected ? colors.heading : 'transparent',
              },
            ]}
            onPress={() => setPalette(option.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`Paleta ${option.label}`}
          >
            <View style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: ink }]} />
              <View style={[styles.swatch, styles.swatchOverlap, { backgroundColor: accent }]} />
            </View>
            <Text
              style={[
                styles.paletteLabel,
                { color: selected ? colors.heading : colors.textMuted },
              ]}
            >
              {option.label}
            </Text>
            {selected && (
              <Ionicons name="checkmark-circle" size={15} color={colors.heading} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function StatTile({ value, label, colors }) {
  return (
    <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.heading }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function AchievementCard({ achievement, colors, accent }) {
  const { unlocked, progress, target } = achievement;
  const ratio = target > 0 ? Math.min(progress / target, 1) : 0;

  return (
    <View
      style={[
        styles.achievement,
        {
          backgroundColor: colors.surface,
          borderColor: unlocked ? accent : colors.border,
          opacity: unlocked ? 1 : 0.72,
        },
      ]}
    >
      <View
        style={[
          styles.achievementIcon,
          { backgroundColor: unlocked ? accent : colors.surfaceAlt },
        ]}
      >
        <Ionicons
          name={unlocked ? achievement.icon : 'lock-closed'}
          size={19}
          color={unlocked ? '#fff' : colors.textFaint}
        />
      </View>

      <View style={styles.achievementBody}>
        <Text
          style={[styles.achievementTitle, { color: unlocked ? colors.heading : colors.textMuted }]}
          numberOfLines={2}
        >
          {achievement.title}
        </Text>
        <Text style={[styles.achievementDesc, { color: colors.textFaint }]} numberOfLines={2}>
          {achievement.description}
        </Text>

        {!unlocked && (
          <View style={styles.achievementProgress}>
            <View style={[styles.achievementTrack, { backgroundColor: colors.track }]}>
              <View
                style={[
                  styles.achievementFill,
                  { width: `${ratio * 100}%`, backgroundColor: colors.textFaint },
                ]}
              />
            </View>
            <Text style={[styles.achievementCount, { color: colors.textFaint }]}>
              {progress}/{target}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { colors, mode, setTheme, palette, palettes, setPalette } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchStats()
        .then((data) => !cancelled && setStats(data))
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
      return () => {
        cancelled = true;
      };
    }, [])
  );

  function confirmDelete() {
    Alert.alert(
      'Excluir conta',
      'Isso apaga sua conta e TODAS as suas coleções, anotações e conquistas. '
        + 'A ação é permanente e não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Tem certeza?', 'Última confirmação. Não há como recuperar depois.', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Excluir tudo',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAccount();
                  } catch {
                    Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
                  }
                },
              },
            ]),
        },
      ]
    );
  }

  const visible = (stats?.achievements ?? []).filter(
    (a) => !HIDDEN_ACHIEVEMENTS.includes(a.code)
  );
  const unlockedCount = visible.filter((a) => a.unlocked).length;
  // Desbloqueadas primeiro; dentro de cada grupo, as mais próximas do alvo.
  const ordered = [...visible].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return b.progress / b.target - a.progress / a.target;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 110 },
      ]}
    >
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: colors.heading }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>
            {user?.name?.[0]?.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.heading }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.heading} style={styles.loader} />
      ) : (
        <>
          <View
            style={[
              styles.streakCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.streakIcon, { backgroundColor: `${colors.accent}26` }]}>
              <Ionicons name="flame" size={24} color={colors.accent} />
            </View>
            <View style={styles.streakText}>
              <Text style={[styles.streakValue, { color: colors.heading }]}>
                {stats?.streak_count ?? 0}{' '}
                <Text style={styles.streakUnit}>
                  {stats?.streak_count === 1 ? 'dia seguido' : 'dias seguidos'}
                </Text>
              </Text>
              <Text style={[styles.streakBest, { color: colors.textMuted }]}>
                Seu recorde: {stats?.longest_streak ?? 0} dias
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatTile value={stats?.total ?? 0} label="Cadastradas" colors={colors} />
            <StatTile value={stats?.finished ?? 0} label="Finalizadas" colors={colors} />
            <StatTile value={stats?.in_progress ?? 0} label="Em andamento" colors={colors} />
          </View>

          <View style={styles.achievementsHead}>
            <Text style={[styles.sectionTitle, { color: colors.heading }]}>Conquistas</Text>
            <Text style={[styles.achievementsCount, { color: colors.textMuted }]}>
              {unlockedCount} de {visible.length}
            </Text>
          </View>

          <View style={styles.achievementsList}>
            {ordered.map((achievement) => (
              <AchievementCard
                key={achievement.code}
                achievement={achievement}
                colors={colors}
                accent={colors.accent}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.heading }]}>Configurações</Text>
        <View
          style={[
            styles.settingRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="contrast-outline" size={19} color={colors.text} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>Tema</Text>
          <ThemeSwitch mode={mode} setTheme={setTheme} colors={colors} />
        </View>

        <View
          style={[
            styles.settingBlock,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.settingBlockHead}>
            <Ionicons name="color-palette-outline" size={19} color={colors.text} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>Cores</Text>
          </View>
          <PaletteSwitch
            palette={palette}
            palettes={palettes}
            setPalette={setPalette}
            colors={colors}
          />
        </View>
      </View>

      <Pressable
        style={[styles.logoutButton, { borderColor: colors.border }]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.heading} />
        <Text style={[styles.logoutText, { color: colors.heading }]}>Sair</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={confirmDelete}>
        <Ionicons name="trash-outline" size={15} color={colors.danger} />
        <Text style={[styles.deleteText, { color: colors.danger }]}>Excluir conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 22 },
  identity: { alignItems: 'center', gap: 4 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 30, fontWeight: '800' },
  name: { fontSize: 21, fontWeight: '700' },
  email: { fontSize: 13.5 },
  loader: { marginVertical: 40 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: { flex: 1 },
  streakValue: { fontSize: 20, fontWeight: '800' },
  streakUnit: { fontSize: 14, fontWeight: '600' },
  streakBest: { fontSize: 12.5, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11.5, fontWeight: '600', textAlign: 'center' },
  achievementsHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  achievementsCount: { fontSize: 13, fontWeight: '600' },
  achievementsList: { gap: 10 },
  achievement: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementBody: { flex: 1, gap: 3 },
  achievementTitle: { fontSize: 14, fontWeight: '700' },
  achievementDesc: { fontSize: 12, lineHeight: 16 },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  achievementTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  achievementFill: { height: '100%', borderRadius: 999 },
  achievementCount: { fontSize: 11, fontWeight: '700' },
  settingsSection: { gap: 10 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  settingBlock: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  settingBlockHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paletteRow: { flexDirection: 'row', gap: 8 },
  paletteOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  swatchWrap: { flexDirection: 'row', alignItems: 'center' },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  swatchOverlap: { marginLeft: -7 },
  paletteLabel: { fontSize: 12.5, fontWeight: '700' },
  themeSwitch: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  themeLabel: { fontSize: 12.5, fontWeight: '700' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 6,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteText: { fontSize: 13.5, fontWeight: '600' },
});
