import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MEDIA_THEME, useTheme } from '../context/ThemeContext';
import { progressFor } from '../mediaProgress';
import ProgressBar from './ProgressBar';
import StarRating from './StarRating';
import StatusPill from './StatusPill';

export default function MediaCard({
  item,
  type,
  expanded,
  onToggle,
  onOpenDetail,
  onEdit,
  onDelete,
  onQuickProgress,
  onQuickFinish,
  busy = false,
}) {
  const { colors } = useTheme();
  const media = MEDIA_THEME[type];
  const progress = progressFor(type);

  const chevron = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: expanded ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [expanded, chevron]);

  const rotate = chevron.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const isFinished = item.status === 'finalizado';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: expanded ? media.gradient[0] : colors.border,
          shadowOpacity: colors.shadowOpacity,
        },
      ]}
    >
      <Pressable style={styles.head} onPress={onToggle}>
        <LinearGradient
          colors={media.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Ionicons name={media.icon} size={18} color="#fff" />
        </LinearGradient>

        <View style={styles.headText}>
          <Text style={[styles.title, { color: colors.heading }]} numberOfLines={expanded ? 3 : 1}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <StatusPill status={item.status} size="sm" />
            {item.rating != null && <StarRating value={item.rating} readOnly size={12} />}
          </View>
        </View>

        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textFaint} />
        </Animated.View>
      </Pressable>

      {progress && !isFinished && (
        <View style={styles.progressRow}>
          <ProgressBar
            current={item[progress.current]}
            total={item[progress.total]}
            label={progress.label}
            color={media.gradient[0]}
            compact
          />
        </View>
      )}

      {expanded && (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {item.notes ? (
            <Text style={[styles.notes, { color: colors.textMuted }]} numberOfLines={3}>
              {item.notes}
            </Text>
          ) : (
            <Text style={[styles.notesEmpty, { color: colors.textFaint }]}>
              Sem anotações ainda.
            </Text>
          )}

          {progress && !isFinished && (
            <View style={styles.quickRow}>
              <Pressable
                disabled={busy}
                style={[styles.quickButton, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => onQuickProgress(1)}
              >
                <Ionicons name="add" size={15} color={colors.heading} />
                <Text style={[styles.quickText, { color: colors.heading }]}>1 {progress.step}</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                style={[styles.quickButton, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => onQuickProgress(10)}
              >
                <Ionicons name="add" size={15} color={colors.heading} />
                <Text style={[styles.quickText, { color: colors.heading }]}>10</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                style={[styles.quickButton, { backgroundColor: `${colors.accent}2A` }]}
                onPress={onQuickFinish}
              >
                <Ionicons name="checkmark" size={15} color={colors.accent} />
                <Text style={[styles.quickText, { color: colors.accent }]}>Finalizar</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable style={styles.action} onPress={onOpenDetail}>
              <Ionicons name="reader-outline" size={16} color={colors.heading} />
              <Text style={[styles.actionText, { color: colors.heading }]}>Detalhes</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={onEdit}>
              <Ionicons name="create-outline" size={16} color={colors.heading} />
              <Text style={[styles.actionText, { color: colors.heading }]}>Editar</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>Excluir</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  progressRow: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  body: {
    borderTopWidth: 1,
    padding: 14,
    gap: 14,
  },
  notes: {
    fontSize: 13,
    lineHeight: 19,
  },
  notesEmpty: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  quickText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 18,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
