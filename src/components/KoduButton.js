import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../constants/theme';

export default function KoduButton({ title, onPress, variant = 'primary', loading, style, disabled }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        variant === 'primary' && shadows.soft,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.textDim : colors.white} />
      ) : (
        <Text style={[styles.text, variant === 'ghost' && styles.ghostText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  ghostText: {
    color: colors.textDim,
  },
});
