import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import Mascot from './Mascot';

const CAMPFIRE_STATES = [
  { size: 40, glow: 'rgba(255,138,0,0.2)' },
  { size: 48, glow: 'rgba(255,138,0,0.3)' },
  { size: 56, glow: 'rgba(255,138,0,0.4)' },
  { size: 64, glow: 'rgba(255,138,0,0.5)' },
  { size: 72, glow: 'rgba(255,138,0,0.6)' },
];

function getMascotExpression(mood) {
  switch (mood) {
    case 'great': return 'happy';
    case 'okay': return 'calm';
    case 'anxious': return 'worried';
    case 'low': return 'sleepy';
    case 'drained': return 'sleepy';
    default: return 'calm';
  }
}

function getCampfireState(dayCount) {
  if (dayCount >= 90) return 4;
  if (dayCount >= 30) return 3;
  if (dayCount >= 14) return 2;
  if (dayCount >= 7) return 1;
  return 0;
}

export default function CampsiteScene({ onCampfirePress, onMascotPress }) {
  const { state } = useApp();
  const dayCount = state.dayCount || 0;
  const fireState = CAMPFIRE_STATES[getCampfireState(dayCount)];
  const expr = getMascotExpression(state.mood);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMascotPress} activeOpacity={0.8} style={styles.mascotWrap}>
        <Mascot expression={expr} size={60} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onCampfirePress} activeOpacity={0.8} style={styles.fireWrap}>
        <View style={[styles.fireGlow, { width: fireState.size * 2.4, height: fireState.size * 2.4, borderRadius: fireState.size * 1.2, backgroundColor: fireState.glow }]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '28%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
  },
  mascotWrap: {
    marginBottom: -8,
    zIndex: 2,
  },
  fireWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fireGlow: {
    position: 'absolute',
  },
});
