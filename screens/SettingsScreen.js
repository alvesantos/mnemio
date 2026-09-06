import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const OPTIONS = [
  { key: 'light', label: 'Claro', icon: 'sunny' },
  { key: 'dark', label: 'Escuro', icon: 'moon' },
];

export default function SettingsScreen() {
  const { mode, colors, setTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <Text style={[styles.pageTitle, { color: colors.heading }]}>Configurações</Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tema</Text>

      {OPTIONS.map((option) => {
        const selected = option.key === mode;
        return (
          <Pressable
            key={option.key}
            style={[
              styles.option,
              { backgroundColor: colors.surface, borderColor: selected ? colors.heading : colors.border },
            ]}
            onPress={() => setTheme(option.key)}
          >
            <Ionicons name={option.icon} size={20} color={colors.text} style={styles.optionIcon} />
            <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
            {selected && <Ionicons name="checkmark-circle" size={20} color={colors.heading} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});
