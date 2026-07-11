import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { C, mono, S } from '../theme';
import { DAILY_FIRST_TICKET_XP } from '../storage';
import { AnimatedBar, CountUp, FadeSlideIn, PopIn, PressScale } from '../ui/fx';

const FEEDBACK_EMAIL = 'help@spillerstech.us';

function sendFeedback(scenario) {
  const subject = encodeURIComponent(`OpsQuest feedback: ${scenario.ticket} ${scenario.title}`);
  const body = encodeURIComponent(
    'What felt wrong about this ticket? (scoring, realism, a choice that made no sense...)\n\n'
  );
  Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(() => {
    // No mail app configured — nothing sensible to do on-device.
  });
}

// Debrief ranks by combined score vs the scenario's best-path max.
export function rankFor(combined, maxScore) {
  const pct = maxScore > 0 ? combined / maxScore : 0;
  if (pct >= 0.8) return { title: 'Senior Tech material', color: C.green };
  if (pct >= 0.5) return { title: 'Solid L1', color: C.amber };
  return { title: 'Review the runbook', color: C.red };
}

function ScoreBar({ label, value, max, color, delay }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={styles.barBlock}>
      <View style={styles.barLabelRow}>
        <Text style={[styles.barLabel, { color }]}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{value}</Text>
      </View>
      <AnimatedBar pct={pct} color={color} trackColor={C.panelHi} height={8} delay={delay} />
    </View>
  );
}

export default function DebriefScreen({ scenario, result, xpGain, dailyBonus, onReplay, onHome }) {
  const combined = result.tech + result.people;
  const rank = rankFor(combined, scenario.maxScore);
  // Rough split of the best path so each bar has a sane ceiling
  const halfMax = Math.ceil(scenario.maxScore / 2);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <FadeSlideIn delay={0}>
        <Text style={styles.header}>── TICKET DEBRIEF ──</Text>
        <Text style={styles.ticketId}>{scenario.ticket} · {scenario.title}</Text>
      </FadeSlideIn>

      <FadeSlideIn delay={140} style={styles.card}>
        <Text style={styles.combinedLabel}>COMBINED SCORE</Text>
        <View style={styles.combinedRow}>
          <CountUp value={combined} duration={700} delay={260} style={styles.combined} />
          <Text style={styles.combinedMax}> / {scenario.maxScore}</Text>
        </View>
        <PopIn delay={1020} from={0.55}>
          <Text style={[styles.rank, { color: rank.color }]}>{rank.title}</Text>
        </PopIn>
      </FadeSlideIn>

      <FadeSlideIn delay={900} style={styles.card}>
        <ScoreBar label="TECH" value={result.tech} max={halfMax} color={C.cyan} delay={1080} />
        <ScoreBar label="PEOPLE" value={result.people} max={halfMax} color={C.violet} delay={1230} />
      </FadeSlideIn>

      <PopIn delay={1480} from={0.7} style={styles.xpCard}>
        <CountUp value={xpGain} duration={600} delay={1580} style={styles.xpText} prefix="+" suffix=" XP" />
        <Text style={styles.xpSub}>added to your record</Text>
        {dailyBonus > 0 && (
          <FadeSlideIn delay={2200} dy={8}>
            <Text style={styles.xpBonus}>
              ☀ includes +{DAILY_FIRST_TICKET_XP} first ticket of the day
            </Text>
          </FadeSlideIn>
        )}
      </PopIn>

      <FadeSlideIn delay={2320}>
        <PressScale style={styles.replayBtn} onPress={onReplay}>
          <Text style={styles.replayText}>REOPEN TICKET ↺</Text>
        </PressScale>
      </FadeSlideIn>
      <FadeSlideIn delay={2410}>
        <PressScale style={styles.homeBtn} onPress={onHome}>
          <Text style={styles.homeText}>BACK TO QUEUE →</Text>
        </PressScale>
      </FadeSlideIn>

      <FadeSlideIn delay={2500}>
        <PressScale style={styles.feedbackBtn} onPress={() => sendFeedback(scenario)} hitSlop={8}>
          <Text style={styles.feedbackText}>⚑ this ticket felt wrong? tell us</Text>
        </PressScale>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.pad, paddingTop: 32, paddingBottom: 56 },
  header: {
    color: C.dim,
    fontFamily: mono,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  ticketId: {
    color: C.faint,
    fontFamily: mono,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: S.pad * 1.5,
  },
  card: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: 12,
    alignItems: 'center',
  },
  combinedLabel: { color: C.faint, fontFamily: mono, fontSize: 11, marginBottom: 4 },
  combinedRow: { flexDirection: 'row', alignItems: 'baseline' },
  combined: { color: C.text, fontFamily: mono, fontSize: 44, fontWeight: 'bold' },
  combinedMax: { color: C.faint, fontSize: 20 },
  rank: { fontSize: 16, fontWeight: 'bold', marginTop: 6 },

  barBlock: { width: '100%', marginVertical: 8 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontFamily: mono, fontSize: 12, fontWeight: 'bold' },
  barValue: { fontFamily: mono, fontSize: 12, fontWeight: 'bold' },

  xpCard: {
    backgroundColor: C.panelHi,
    borderColor: C.green,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: S.pad * 1.5,
    alignItems: 'center',
  },
  xpText: { color: C.green, fontFamily: mono, fontSize: 26, fontWeight: 'bold' },
  xpSub: { color: C.dim, fontFamily: mono, fontSize: 11, marginTop: 2 },
  xpBonus: { color: C.amber, fontFamily: mono, fontSize: 11, marginTop: 6 },

  replayBtn: {
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  replayText: { color: C.dim, fontFamily: mono, fontSize: 14, fontWeight: 'bold' },
  homeBtn: {
    backgroundColor: C.blue,
    borderRadius: S.radius,
    padding: 16,
    alignItems: 'center',
  },
  homeText: { color: C.bg, fontFamily: mono, fontSize: 15, fontWeight: 'bold' },

  feedbackBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 12 },
  feedbackText: { color: C.faint, fontFamily: mono, fontSize: 12 },
});
