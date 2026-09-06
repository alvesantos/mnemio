import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import StarRating from './StarRating';

function getErrorMessage(err) {
  return err?.response?.data?.detail || 'Não foi possível salvar. Tente novamente.';
}

export default function ItemFormScreen({ initialItem, itemLabel, onSubmit, onCancel }) {
  const isEditing = Boolean(initialItem);
  const [title, setTitle] = useState(initialItem?.title ?? '');
  const [rating, setRating] = useState(initialItem?.rating ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { colors } = useTheme();

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Título é obrigatório.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), rating });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Título</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder={`Nome do ${itemLabel.toLowerCase()}`}
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>Nota</Text>
      <StarRating value={rating} onChange={setRating} size={28} />

      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.heading }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.saveText, { color: colors.background }]}>
              {isEditing ? 'Salvar' : 'Cadastrar'}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    color: '#d93025',
    marginTop: 16,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 32,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#666',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
