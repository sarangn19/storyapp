import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EXPRESSIONS = {
  happy: { face: '', eyes: '◕‿◕' },
  sleepy: { face: '', eyes: '⏝⏝' },
  worried: { face: '', eyes: '◉‿◉' },
  excited: { face: '', eyes: '☆‿☆' },
  calm: { face: '', eyes: '‿‿' },
  listening: { face: '', eyes: '‿‿' },
};

export default function Mascot({ expression = 'calm', size = 80 }) {
  const expr = EXPRESSIONS[expression] || EXPRESSIONS.calm;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.face, { fontSize: size * 0.5 }]}>{expr.face}</Text>
      </View>
    </View>
  );
}

export function MascotWithMessage({ expression, size, message }) {
  return (
    <View style={styles.row}>
      <Mascot expression={expression} size={size || 60} />
      {message && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  face: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bubble: {
    backgroundColor: '#2A1848',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    maxWidth: '75%',
  },
  bubbleText: {
    color: '#F5E6D3',
    fontSize: 15,
    lineHeight: 22,
  },
});
