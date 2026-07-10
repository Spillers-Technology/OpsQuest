import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, PRIORITY, mono, S } from '../theme';
import { levelInfo } from '../storage';
import { SCENARIOS } from '../data/scenarios';
import { BITE_DECKS } from '../data/bites';

export default function HomeScreen({ profile, onPlayScenario, onPlayDeck }) {
  const lvl = levelInfo(profile.xp);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header: identity + streak */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.logo}>OPS QUEST</Text>
          <Text style={styles.tagline}>the queue never sleeps</Text>
        </View>
        <View style={styles.streakPill}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={styles.streakCount}>{profile.streak}</Text>
        </View>
      </View>

      {/* XP / level card */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelTitle}>{lvl.title}</Text>
          <Text style={styles.levelXp}>
            LVL {lvl.level} · {profile.xp} XP
          </Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${(lvl.intoLevel / lvl.toNext) * 100}%` }]} />
        </View>
        <Text style={styles.xpToNext}>
          {lvl.toNext - lvl.intoLevel} XP to next level
        </Text>
      </View>

      {/* Ticket queue */}
      <Text style={styles.sectionLabel}>▸ TICKET QUEUE</Text>
      {SCENARIOS.map((sc) => {
        const pri = PRIORITY[sc.priority];
        const best = profile.completed[sc.id];
        return (
          <Pressable
            key={sc.id}
            style={({ pressed }) => [styles.ticket, pressed && styles.pressed]}
            onPress={() => onPlayScenario(sc)}
          >
            <View style={[styles.stripe, { backgroundColor: pri.color }]} />
            <View style={styles.ticketBody}>
              <View style={styles.ticketMeta}>
                <Text style={[styles.ticketId]}>{sc.ticket}</Text>
                <Text style={[styles.priLabel, { color: pri.color }]}>{pri.label}</Text>
              </View>
              <Text style={styles.ticketTitle}>{sc.title}</Text>
              <Text style={styles.ticketClient}>{sc.client}</Text>
              <Text style={styles.ticketBlurb}>{sc.blurb}</Text>
              {best != null && (
                <Text style={styles.ticketDone}>
                  ✓ RESOLVED · best {best}/{sc.maxScore}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}

      {/* Skill bites */}
      <Text style={styles.sectionLabel}>▸ SKILL BITES</Text>
      {BITE_DECKS.map((deck) => (
        <Pressable
          key={deck.id}
          style={({ pressed }) => [styles.deck, pressed && styles.pressed]}
          onPress={() => onPlayDeck(deck)}
        >
          <Text style={styles.deckIcon}>⚡</Text>
          <View style={styles.deckBody}>
            <Text style={styles.deckTitle}>{deck.title}</Text>
            <Text style={styles.deckBlurb}>{deck.blurb}</Text>
            <Text style={styles.deckCount}>{deck.questions.length} questions</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.pad, paddingBottom: 48 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.pad,
  },
  logo: { color: C.text, fontFamily: mono, fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },
  tagline: { color: C.faint, fontFamily: mono, fontSize: 11, marginTop: 2 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakFlame: { fontSize: 16, marginRight: 6 },
  streakCount: { color: C.green, fontFamily: mono, fontSize: 18, fontWeight: 'bold' },

  levelCard: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: S.pad * 1.5,
  },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  levelTitle: { color: C.text, fontSize: 16, fontWeight: 'bold' },
  levelXp: { color: C.dim, fontFamily: mono, fontSize: 13 },
  xpTrack: {
    height: 8,
    backgroundColor: C.panelHi,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: { height: 8, backgroundColor: C.cyan, borderRadius: 4 },
  xpToNext: { color: C.faint, fontFamily: mono, fontSize: 11, marginTop: 8 },

  sectionLabel: {
    color: C.dim,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  ticket: {
    flexDirection: 'row',
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: C.panelHi },
  stripe: { width: 5 },
  ticketBody: { flex: 1, padding: S.pad },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ticketId: { color: C.faint, fontFamily: mono, fontSize: 12 },
  priLabel: { fontFamily: mono, fontSize: 12, fontWeight: 'bold' },
  ticketTitle: { color: C.text, fontSize: 17, fontWeight: 'bold', marginBottom: 2 },
  ticketClient: { color: C.dim, fontSize: 13, marginBottom: 6 },
  ticketBlurb: { color: C.dim, fontSize: 13, fontStyle: 'italic' },
  ticketDone: { color: C.green, fontFamily: mono, fontSize: 12, marginTop: 8 },

  deck: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: 12,
  },
  deckIcon: { fontSize: 22, marginRight: 12 },
  deckBody: { flex: 1 },
  deckTitle: { color: C.text, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  deckBlurb: { color: C.dim, fontSize: 13 },
  deckCount: { color: C.faint, fontFamily: mono, fontSize: 11, marginTop: 6 },
});
