import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import KoduButton from '../components/KoduButton';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { COPY } from '../constants/copy';
import { useApp } from '../context/AppContext';

export default function TherapistScreen({ navigation }) {
  const { dispatch } = useApp();

  function handleTalk() {
    dispatch({ type: 'ADD_MEMORY', payload: { type: 'therapy', text: 'Sought professional support', emoji: '❤️' } });
    Linking.openURL('https://findahelpline.com');
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.emoji}>🫂</Text>
        <Text style={styles.title}>{COPY.therapist.title}</Text>
        <Text style={styles.body}>{COPY.therapist.body}</Text>
        <View style={styles.buttons}>
          <KoduButton title={COPY.therapist.talkButton} onPress={handleTalk} style={styles.button} />
          <KoduButton title={COPY.therapist.laterButton} variant="ghost" onPress={() => navigation.goBack()} style={styles.button} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { fontSize: typography.subtitle, color: colors.text, fontWeight: '600', textAlign: 'center', marginBottom: spacing.md },
  body: { fontSize: typography.body, color: colors.textDim, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xxl },
  buttons: { width: '100%', gap: spacing.sm },
  button: { width: '100%' },
});
