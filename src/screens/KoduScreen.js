import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import KoduButton from '../components/KoduButton';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { COPY } from '../constants/copy';
import { useApp } from '../context/AppContext';

const loadingMessages = COPY.kodu.loading;

function generateResponse(userText, state, dispatch) {
  const lower = userText.toLowerCase();
  const stressWords = ['stress', 'anxious', 'worried', 'scared', 'nervous', 'panic', 'overwhelmed'];
  const sadWords = ['sad', 'lonely', 'alone', 'cry', 'depressed', 'hopeless'];
  const happyWords = ['happy', 'great', 'good', 'wonderful', 'amazing', 'excited', 'grateful'];
  const therapyWords = ['therapy', 'help', 'professional', 'doctor', 'therapist'];

  if (therapyWords.some((w) => lower.includes(w))) {
    return { text: "It takes courage to ask for help. Would you like me to connect you with someone who can support you further?", action: 'therapy' };
  }
  if (stressWords.some((w) => lower.includes(w))) {
    dispatch({ type: 'ADD_MEMORY', payload: { type: 'stress', text: userText, emoji: '🌧️' } });
    return { text: "I hear you. That sounds really hard. Do you want to try a breathing exercise together?", action: 'breathe' };
  }
  if (sadWords.some((w) => lower.includes(w))) {
    dispatch({ type: 'ADD_MEMORY', payload: { type: 'sad', text: userText, emoji: '🌧️' } });
    return { text: "I'm here with you. You don't have to go through this alone. Want to plant a gratitude seed?", action: 'gratitude' };
  }
  if (happyWords.some((w) => lower.includes(w))) {
    dispatch({ type: 'ADD_MEMORY', payload: { type: 'happy', text: userText, emoji: '🌟' } });
    return { text: "That's wonderful! I'm so glad to hear that. Let's hold onto this feeling." };
  }
  const generic = [
    "Thank you for sharing that with me.",
    "I'm listening. Tell me more.",
    "That makes sense. How does that feel?",
    "I appreciate you telling me this.",
    "You're doing really well.",
    "Let's sit with that for a moment.",
  ];
  return { text: generic[Math.floor(Math.random() * generic.length)] };
}

export default function KoduScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const flatListRef = useRef(null);
  const hasSentMessage = state.koduMessages?.length > 0;
  const pattern = state.pattern;

  function handleSend() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim(), id: Date.now().toString() };
    dispatch({ type: 'ADD_KODU_MESSAGE', payload: userMsg });
    setInput('');
    setIsThinking(true);
    setLoadingText(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setTimeout(() => {
      setIsThinking(false);
      const response = generateResponse(input.trim(), state, dispatch);
      dispatch({ type: 'ADD_KODU_MESSAGE', payload: { role: 'kodu', text: response.text, id: (Date.now() + 1).toString(), action: response.action } });
    }, 1500);
  }

  function getInitialMessage() {
    const recentMoods = state.moods?.slice(-3) || [];
    if (recentMoods.length >= 2) return `Last time you checked in, you were feeling ${recentMoods[recentMoods.length - 1]?.mood || 'okay'}. How are things now?`;
    return COPY.kodu.firstVisit;
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {!hasSentMessage ? (
          <View style={styles.emptyState}>
            <View style={styles.mascotCircle}>
              <Text style={styles.mascotFace}>🤖</Text>
            </View>
            <Text style={styles.welcomeText}>{getInitialMessage()}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={state.koduMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.koduBubble]}>
                {item.role === 'kodu' && <Text style={styles.koduName}>Kodu</Text>}
                <Text style={[styles.messageText, item.role === 'user' && styles.userText]}>{item.text}</Text>
                {item.action === 'therapy' && <KoduButton title="Talk to Someone" onPress={() => navigation.navigate('Therapist')} style={styles.actionButton} />}
              </View>
            )}
            ListFooterComponent={
              isThinking ? (
                <View style={styles.thinkingBubble}>
                  <Text style={styles.koduName}>Kodu</Text>
                  <Text style={styles.thinkingText}>{loadingText}</Text>
                </View>
              ) : null
            }
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Text style={styles.sendButton} onPress={handleSend}>Send</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 80 },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl,
  },
  mascotCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#2A1848', alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2, borderColor: 'rgba(255,138,0,0.25)',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 6,
  },
  mascotFace: { fontSize: 36 },
  welcomeText: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.textDim, textAlign: 'center', lineHeight: 26, maxWidth: 280 },
  messagesList: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xs },
  bubble: {
    maxWidth: '82%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,138,0,0.3)',
  },
  koduBubble: {
    backgroundColor: 'rgba(42,24,72,0.7)', alignSelf: 'flex-start', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  koduName: { fontFamily: typography.fontFamily, fontSize: typography.small, color: colors.primaryLight, marginBottom: spacing.xs, fontWeight: '600' },
  messageText: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.text, lineHeight: 22 },
  userText: { color: colors.bg, fontWeight: '500' },
  actionButton: { marginTop: spacing.sm, marginBottom: spacing.xs },
  thinkingBubble: {
    backgroundColor: 'rgba(42,24,72,0.5)', alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  thinkingText: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.textDim, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm, paddingHorizontal: spacing.xs,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(18,11,36,0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  input: {
    flex: 1, backgroundColor: 'rgba(74,58,117,0.25)', borderRadius: borderRadius.full,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, color: colors.text, fontSize: typography.body, fontFamily: typography.fontFamily,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  sendButton: {
    fontFamily: typography.fontFamily, color: colors.primary, fontSize: typography.body, fontWeight: '700', paddingHorizontal: spacing.md,
  },
});
