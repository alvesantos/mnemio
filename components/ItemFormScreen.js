import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STATUS_OPTIONS, useTheme } from '../context/ThemeContext';
import { progressFor } from '../mediaProgress';
import StarRating from './StarRating';

function getErrorMessage(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return 'Não foi possível salvar. Tente novamente.';
}

/** Converte texto de input numérico em inteiro, tratando vazio como null. */
function toNumber(text) {
  const digits = text.replace(/[^0-9]/g, '');
  return digits === '' ? null : Number(digits);
}

export default function ItemFormScreen({ initialItem, itemLabel, type, onSubmit, onCancel }) {
  const isEditing = Boolean(initialItem);
  const progress = progressFor(type);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState(initialItem?.title ?? '');
  const [rating, setRating] = useState(initialItem?.rating ?? null);
  const [status, setStatus] = useState(initialItem?.status ?? 'plano');
  const [notes, setNotes] = useState(initialItem?.notes ?? '');
  const [current, setCurrent] = useState(
    progress ? String(initialItem?.[progress.current] ?? 0) : '0'
  );
  const [total, setTotal] = useState(
    progress && initialItem?.[progress.total] != null ? String(initialItem[progress.total]) : ''
  );
  const [extra, setExtra] = useState(
    progress?.extra ? String(initialItem?.[progress.extra.field] ?? 0) : '0'
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Título é obrigatório.');
      return;
    }

    const payload = {
      title: title.trim(),
      rating,
      status,
      notes: notes.trim() === '' ? null : notes.trim(),
    };

    if (progress) {
      payload[progress.current] = toNumber(current) ?? 0;
      payload[progress.total] = toNumber(total);
      if (progress.extra) {
        payload[progress.extra.field] = toNumber(extra) ?? 0;
      }
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  }

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: colors.textMuted }]}>Título</Text>
        <TextInput
          style={inputStyle}
          placeholder={`Nome do ${itemLabel.toLowerCase()}`}
          placeholderTextColor={colors.textFaint}
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>Status</Text>
        <View style={styles.statusGrid}>
          {STATUS_OPTIONS.map((option) => {
            const active = option.value === status;
            return (
              <Pressable
                key={option.value}
                onPress={() => setStatus(option.value)}
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

        {progress && (
          <>
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  {progress.currentLabel}
                </Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textFaint}
                  value={current}
                  onChangeText={setCurrent}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={[styles.label, { color: colors.textMuted }]}>{progress.totalLabel}</Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="number-pad"
                  placeholder="opcional"
                  placeholderTextColor={colors.textFaint}
                  value={total}
                  onChangeText={setTotal}
                />
              </View>
            </View>

            {progress.extra && (
              <>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  {progress.extra.label}
                </Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textFaint}
                  value={extra}
                  onChangeText={setExtra}
                />
              </>
            )}

            <View style={[styles.hint, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="information-circle-outline" size={15} color={colors.textMuted} />
              <Text style={[styles.hintText, { color: colors.textMuted }]}>
                Registrar qualquer progresso move o item para "Em andamento"
                automaticamente.
              </Text>
            </View>
          </>
        )}

        <Text style={[styles.label, { color: colors.textMuted }]}>Nota</Text>
        <StarRating value={rating} onChange={setRating} size={30} />

        <Text style={[styles.label, { color: colors.textMuted }]}>Anotações</Text>
        <TextInput
          style={[...inputStyle, styles.textArea]}
          placeholder="O que você achou? O que gostou, o que não gostou..."
          placeholderTextColor={colors.textFaint}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 18,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15.5,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
    lineHeight: 21,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    marginTop: 18,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 30,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
