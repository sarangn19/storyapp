import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import KoduButton from '../components/KoduButton';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { COPY } from '../constants/copy';
import { FOREST_MILESTONES } from '../constants/forestMilestones';
import { useApp } from '../context/AppContext';

export default function JourneyScreen({ navigation }) {
  const { state } = useApp();
  const memories = state.memories || [];
  const dayCount = state.dayCount;
  const nextMilestone = FOREST_MILESTONES.find((m) => dayCount < m.day);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>🗺️ Your Journey</Text>

        <View style={styles.statsRow}>
          <StatBox icon="🔥" label="Day" value={dayCount + 1} />
          <StatBox icon="🧠" label="Check-ins" value={state.moods?.length || 0} />
          <StatBox icon="🌲" label="Trees" value={state.treesCount || 0} />
          <StatBox icon="🌸" label="Flowers" value={state.flowerCount || 0} />
        </View>

        <Text style={styles.sectionHeader}>🌿 Milestones</Text>
        <View style={styles.milestonesPath}>
          {FOREST_MILESTONES.map((m) => {
            const reached = dayCount >= m.day;
            return (
              <View key={m.day} style={styles.milestoneRow}>
                <View style={styles.milestoneDot}>
                  <Text style={styles.milestoneIcon}>{reached ? '⭐' : '🔒'}</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={[styles.milestoneLabel, !reached && styles.milestoneLocked]}>{m.label}</Text>
                  <Text style={[styles.milestoneDesc, !reached && styles.milestoneLocked]}>{m.description}</Text>
                </View>
                {reached && <Text style={styles.checkmark}>✓</Text>}
              </View>
            );
          })}
        </View>

        {nextMilestone && (
          <View style={[styles.nextHint, shadows.card]}>
            <Text style={styles.nextHintText}>Next milestone in {nextMilestone.day - dayCount} days</Text>
          </View>
        )}

        {memories.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>💭 Memories</Text>
            <View style={styles.memoriesList}>
              {memories.slice().reverse().slice(0, 20).map((mem, i) => (
                <View key={i} style={styles.memoryCard}>
                  <Text style={styles.memoryEmoji}>{mem.emoji || '💭'}</Text>
                  <View style={styles.memoryContent}>
                    <Text style={styles.memoryText}>{mem.text}</Text>
                    <Text style={styles.memoryDate}>{new Date(mem.date).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {memories.length === 0 && (
          <View style={styles.emptyMemories}>
            <Text style={styles.emptyText}>{COPY.journey.emptyMemories}</Text>
          </View>
        )}

        <KoduButton title="Back to Camp" variant="secondary" onPress={() => navigation.goBack()} style={styles.backButton} />
      </ScrollView>
    </ScreenWrapper>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  header: { fontFamily: typography.fontFamily, fontSize: typography.subtitle, color: colors.text, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xl },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl, paddingHorizontal: spacing.xs },
  statBox: {
    flex: 1, backgroundColor: 'rgba(42,24,72,0.6)', borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  statIcon: { fontSize: 24, marginBottom: spacing.xs },
  statValue: { fontFamily: typography.fontFamily, fontSize: typography.title, color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
  statLabel: { fontFamily: typography.fontFamily, fontSize: typography.small, color: colors.textDim, marginTop: 2 },
  sectionHeader: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.text, fontWeight: '600', marginBottom: spacing.md, marginTop: spacing.sm },
  milestonesPath: { gap: 0, marginBottom: spacing.lg, paddingLeft: spacing.xs },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  milestoneDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,138,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  milestoneIcon: { fontSize: 14 },
  milestoneContent: { flex: 1, marginLeft: spacing.xs },
  milestoneLabel: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.text, fontWeight: '500' },
  milestoneDesc: { fontFamily: typography.fontFamily, fontSize: typography.caption, color: colors.textDim, marginTop: 2 },
  milestoneLocked: { color: colors.textMuted },
  checkmark: { color: colors.primary, fontSize: 16, fontWeight: '700', width: 24, textAlign: 'center' },
  nextHint: {
    backgroundColor: 'rgba(255,138,0,0.08)', borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.xl,
    borderWidth: 1, borderColor: 'rgba(255,138,0,0.15)',
  },
  nextHintText: { fontFamily: typography.fontFamily, color: colors.primaryLight, fontSize: typography.caption, fontWeight: '500' },
  memoriesList: { gap: spacing.sm, marginBottom: spacing.xl },
  memoryCard: {
    flexDirection: 'row', backgroundColor: 'rgba(42,24,72,0.6)', borderRadius: borderRadius.md, padding: spacing.md, gap: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  memoryEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  memoryContent: { flex: 1 },
  memoryText: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.text },
  memoryDate: { fontFamily: typography.fontFamily, fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  emptyMemories: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontFamily: typography.fontFamily, fontSize: typography.body, color: colors.textDim, textAlign: 'center', lineHeight: 24 },
  backButton: { marginTop: spacing.md },
});
