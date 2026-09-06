import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SegmentedControl({ options, value, onChange }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.border }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, active && [styles.segmentActive, { backgroundColor: colors.surface }]]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, { color: active ? colors.heading : colors.textMuted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    margin: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
