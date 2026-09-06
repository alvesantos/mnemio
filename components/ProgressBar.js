import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Barra de progresso. Sem total definido não há percentual honesto a mostrar,
 * então exibe apenas o número absoluto ("120 páginas") em vez de fingir uma
 * barra cheia.
 */
export default function ProgressBar({ current, total, label, color, compact = false }) {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;

  const hasTotal = typeof total === 'number' && total > 0;
  const value = current ?? 0;
  const ratio = hasTotal ? Math.min(value / total, 1) : null;

  return (
    <View style={styles.wrapper}>
      {hasTotal && (
        <View style={[styles.track, compact && styles.trackCompact, { backgroundColor: colors.track }]}>
          <View
            style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: tint }]}
          />
        </View>
      )}
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        {hasTotal
          ? `${value} de ${total} ${label} · ${Math.round(ratio * 100)}%`
          : `${value} ${label}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 5,
  },
  track: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  trackCompact: {
    height: 5,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  caption: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
