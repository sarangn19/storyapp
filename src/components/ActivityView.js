import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import KoduButton from './KoduButton';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';

function BreathingActivity({ onComplete }) {
  const { dispatch } = useApp();
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const breatheAnim = useRef(new Animated.Value(0)).current;
  const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
  const timerRef = useRef(null);

  useEffect(() => {
    runPhase(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function runPhase(index) {
    if (index >= phases.length) {
      if (cycle >= 2) { dispatch({ type: 'ADD_BREATHING' }); onComplete(); return; }
      setCycle((c) => c + 1); setPhase(0); animateBreathe(0);
      timerRef.current = setTimeout(() => runPhase(1), 4000); return;
    }
    setPhase(index); animateBreathe(index);
    timerRef.current = setTimeout(() => runPhase(index + 1), 4000);
  }

  function animateBreathe(index) {
    breatheAnim.setValue(0);
    if (index === 0 || index === 2) {
      Animated.timing(breatheAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
    }
  }

  const scale = breatheAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's clear the clouds.</Text>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
        <Text style={styles.breatheEmoji}>🌬️</Text>
      </Animated.View>
      <Text style={styles.phaseText}>{phases[phase]}</Text>
      <Text style={styles.cycleText}>Cycle {cycle + 1} of 3</Text>
    </View>
  );
}

function GratitudeActivity({ onComplete }) {
  const { dispatch } = useApp();
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  function handlePlant() {
    if (!input.trim()) return;
    dispatch({ type: 'ADD_GRATITUDE', payload: { text: input.trim() } });
    setDone(true);
    setTimeout(onComplete, 1500);
  }

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeEmoji}>🌸</Text>
        <Text style={styles.title}>A new flower has bloomed 🌸</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant a gratitude seed.</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="What went well today?"
        placeholderTextColor={colors.textMuted}
        multiline
      />
      <KoduButton title="Plant Seed" onPress={handlePlant} disabled={!input.trim()} style={styles.button} />
    </View>
  );
}

function JournalActivity({ onComplete }) {
  const { dispatch } = useApp();
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  function handleSave() {
    if (!input.trim()) return;
    dispatch({ type: 'ADD_JOURNAL', payload: { text: input.trim() } });
    setDone(true);
    setTimeout(onComplete, 1500);
  }

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeEmoji}>🌲</Text>
        <Text style={styles.title}>A tree stands tall 🌲</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture this moment.</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="What is on your mind?"
        placeholderTextColor={colors.textMuted}
        multiline
      />
      <KoduButton title="Save Moment" onPress={handleSave} disabled={!input.trim()} style={styles.button} />
    </View>
  );
}

function FocusActivity({ onComplete }) {
  const { dispatch } = useApp();
  const [countdown, setCountdown] = useState(30);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  function handleStart() {
    setRunning(true);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current); setRunning(false); setDone(true);
          dispatch({ type: 'ADD_FOCUS' }); setTimeout(onComplete, 1500); return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeEmoji}>🔥</Text>
        <Text style={styles.title}>The fire is glowing bright</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rest by the campfire.</Text>
      {!running ? (
        <KoduButton title="Rest for 30s" onPress={handleStart} style={styles.button} />
      ) : (
        <>
          <Text style={styles.countdown}>{countdown}s</Text>
          <Text style={styles.hint}>Let the fire warm you.</Text>
        </>
      )}
    </View>
  );
}

export default function ActivityView({ moodKey, onComplete }) {
  if (!moodKey) return null;
  switch (moodKey) {
    case 'anxious': return <BreathingActivity onComplete={onComplete} />;
    case 'low': return <GratitudeActivity onComplete={onComplete} />;
    case 'drained': return <FocusActivity onComplete={onComplete} />;
    case 'okay':
    case 'great': return <JournalActivity onComplete={onComplete} />;
    default: return <JournalActivity onComplete={onComplete} />;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.subtitle,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(74,58,117,0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  button: { width: '100%' },
  circle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(74,58,117,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  breatheEmoji: { fontSize: 48 },
  phaseText: { fontSize: typography.title, color: colors.text, fontWeight: 'bold' },
  cycleText: { fontSize: typography.caption, color: colors.textDim },
  completeEmoji: { fontSize: 64 },
  countdown: { fontSize: 56, color: colors.primary, fontWeight: 'bold' },
  hint: { fontSize: typography.caption, color: colors.textDim, textAlign: 'center' },
});
