import { Pressable, StyleSheet, Text, View } from 'react-native';

const MAX_STARS = 5;

export default function StarRating({ value, onChange, size = 20, readOnly = false }) {
  const editable = !readOnly && typeof onChange === 'function';
  const stars = Array.from({ length: MAX_STARS }, (_, index) => index + 1);

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const filled = value != null && star <= Math.round(value);
        const StarWrapper = editable ? Pressable : View;
        return (
          <StarWrapper key={star} onPress={editable ? () => onChange(star) : undefined}>
            <Text style={[styles.star, { fontSize: size }, filled && styles.starFilled]}>★</Text>
          </StarWrapper>
        );
      })}
      {editable && value != null && (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text style={styles.clear}>limpar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: '#dadce0',
  },
  starFilled: {
    color: '#f5a623',
  },
  clear: {
    marginLeft: 8,
    color: '#1a73e8',
    fontSize: 12,
  },
});
