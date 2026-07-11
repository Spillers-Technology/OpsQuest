import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, mono, S } from '../theme';
import { FadeSlideIn, PressScale, TypeText, Cursor, buzz } from '../ui/fx';

// First-open gate: pick how the queue talks to you. Changeable later in settings.
export default function DifficultyScreen({ onPick }) {
  return (
    <View style={styles.root}>
      <FadeSlideIn delay={0}>
        <Text style={styles.header}>── SHIFT SETUP ──</Text>
      </FadeSlideIn>
      <TypeText
        text={'New tech on the desk. One question before the queue opens:\n\nHow do you want your tickets served?'}
        speed={180}
        style={styles.intro}
        cursorColor={C.green}
      />

      <FadeSlideIn delay={900} dy={16}>
        <PressScale
          style={[styles.card, { borderColor: C.green }]}
          onPress={() => {
            buzz(18);
            onPick('easy');
          }}
        >
          <Text style={[styles.cardTitle, { color: C.green }]}>◐ ASSISTED MODE</Text>
          <Text style={styles.cardBody}>
            Tickets arrive triaged: category tags on every card, and a senior tech leaves you a
            hint at each decision. Learn the patterns with a safety net.
          </Text>
        </PressScale>
      </FadeSlideIn>

      <FadeSlideIn delay={1100} dy={16}>
        <PressScale
          style={[styles.card, { borderColor: C.red }]}
          onPress={() => {
            buzz(30);
            onPick('hard');
          }}
        >
          <Text style={[styles.cardTitle, { color: C.red }]}>● REAL TECH MODE</Text>
          <Text style={styles.cardBody}>
            Tickets exactly as they hit the queue: "HELP, JOHN", no tags, no hints, wrong contact
            on the card. Just you and your judgment.
          </Text>
        </PressScale>
      </FadeSlideIn>

      <FadeSlideIn delay={1400}>
        <Text style={styles.footnote}>
          switch anytime in settings <Cursor style={{ color: C.faint }} char="▍" />
        </Text>
      </FadeSlideIn>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, padding: S.pad, justifyContent: 'center' },
  header: {
    color: C.dim,
    fontFamily: mono,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 18,
  },
  intro: { color: C.text, fontSize: 15, lineHeight: 23, marginBottom: 24, minHeight: 92 },
  card: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: 14,
  },
  cardTitle: { fontFamily: mono, fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardBody: { color: C.dim, fontSize: 14, lineHeight: 21 },
  footnote: { color: C.faint, fontFamily: mono, fontSize: 11, textAlign: 'center', marginTop: 8 },
});
