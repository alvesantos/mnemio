import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * Etiqueta de status. A cor vem do tema e é a mesma em toda a aplicação,
 * para o usuário aprender o código de cores uma vez só.
 */
export default function StatusPill({ status, size = 'md' }) {
  const { status: statusMeta } = useTheme();
  const meta = statusMeta[status] ?? statusMeta.plano;
  const small = size === 'sm';

  return (
    <View style={[styles.pill, small && styles.pillSmall, { backgroundColor: `${meta.color}22` }]}>
      <Ionicons name={meta.icon} size={small ? 11 : 13} color={meta.color} />
      <Text style={[styles.label, small && styles.labelSmall, { color: meta.color }]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  pillSmall: {
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  labelSmall: {
    fontSize: 10.5,
  },
});
