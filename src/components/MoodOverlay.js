import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { COPY } from '../constants/copy';
import { useApp } from '../context/AppContext';
import KoduButton from './KoduButton';

export default function MoodOverlay({ onComplete, onDismiss }) {
  const { dispatch } = useApp();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSelect(mood) {
    setSelected(mood);
    dispatch({ type: 'ADD_MOOD', payload: { mood: mood.label, emoji: mood.emoji } });
    setTimeout(() => setSubmitted(true), 400);
  }

  function handleContinue() {
    if (onComplete) onComplete(selected);
  }

  if (submitted && selected) {
    const response = COPY.mood.responses[selected.key];
    return (
      <View style={styles.overlay}>
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.responseEmoji}>{selected.emoji}</Text>
          <Text style={styles.responseMessage}>{response.message}</Text>
          <Text style={styles.responseSub}>{response.subtitle}</Text>
          <KoduButton title="Continue" onPress={handleContinue} style={styles.button} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, shadows.card]}>
        <Text style={styles.header}>{COPY.mood.header}</Text>
        <View style={styles.options}>
          {COPY.mood.options.map((mood) => (
            <TouchableOpacity
              key={mood.key}
              style={[styles.option, selected?.key === mood.key && styles.optionSelected]}
              onPress={() => handleSelect(mood)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>{mood.emoji}</Text>
              <Text style={[styles.optionLabel, selected?.key === mood.key && styles.optionLabelSelected]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissArea}>
            <Text style={styles.dismissText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    fontSize: typography.subtitle,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    minWidth: 56,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  optionLabel: {
    fontSize: typography.caption,
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.bg,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    marginTop: spacing.lg,
  },
  dismissArea: {
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  dismissText: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  responseEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  responseMessage: {
    fontSize: typography.subtitle,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  responseSub: {
    fontSize: typography.body,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },
});
