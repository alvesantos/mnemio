import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const VISIBLE_MS = 3800;

/**
 * Renderizado uma única vez, no topo da árvore. Escuta a fila do ToastContext
 * e anima a entrada/saída do toast da conquista no canto superior da tela.
 */
export default function AchievementToast() {
  const { current, dismiss } = useToast();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return undefined;

    // Reposiciona antes de entrar, para o caso de um toast reaproveitar
    // os mesmos valores animados logo após o anterior sair.
    translateY.setValue(-140);
    opacity.setValue(0);

    let timeout;

    const enter = Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]);

    const leave = Animated.parallel([
      Animated.timing(translateY, {
        toValue: -140,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]);

    enter.start(() => {
      timeout = setTimeout(() => leave.start(({ finished }) => finished && dismiss()), VISIBLE_MS);
    });

    return () => {
      clearTimeout(timeout);
      enter.stop();
      leave.stop();
    };
  }, [current, dismiss, opacity, translateY]);

  if (!current) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + 12, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={dismiss}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowOpacity: colors.shadowOpacity,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
          <Ionicons name={current.icon ?? 'trophy'} size={20} color="#fff" />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.kicker, { color: colors.accent }]}>CONQUISTA DESBLOQUEADA</Text>
          <Text style={[styles.title, { color: colors.heading }]} numberOfLines={2}>
            {current.title}
          </Text>
          {current.description ? (
            <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
              {current.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
