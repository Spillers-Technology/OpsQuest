import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, PRIORITY, CATEGORY, mono, S } from '../theme';
import { levelInfo } from '../storage';
import { buildQueue } from '../data/queue';
import { BITE_DECKS } from '../data/bites';
import { AnimatedBar, Cursor, FadeSlideIn, PopIn, PressScale, Pulse } from '../ui/fx';

export default function HomeScreen({
  profile,
  scenarios,
  onPlayScenario,
  onPlayDeck,
  onRefreshQueue,
  onOpenSettings,
}) {
  const lvl = levelInfo(profile.xp);
  const easy = profile.difficulty === 'easy';
  const queue = useMemo(() => buildQueue(scenarios, profile), [scenarios, profile]);

  const ticketStartDelay = 240;
  const skillLabelDelay = ticketStartDelay + Math.min(queue.length, 6) * 70;
  const deckStartDelay = skillLabelDelay + 70;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header: identity + mode + streak */}
      <FadeSlideIn delay={0} style={styles.headerRow}>
        <View>
          <Text style={styles.logo}>OPS QUEST<Cursor style={styles.logoCursor} /></Text>
          <Text style={styles.tagline}>the queue never sleeps</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={onOpenSettings} hitSlop={8}>
            <View style={[styles.modePill, { borderColor: easy ? C.green : C.red }]}>
              <Text style={[styles.modeText, { color: easy ? C.green : C.red }]}>
                {easy ? '◐ ASSISTED' : '● REAL TECH'}
              </Text>
            </View>
          </Pressable>
          <View style={styles.streakPill}>
            <Pulse scale min={0.88} max={1.08} duration={720} style={styles.streakFlameWrap}>
              <Text style={styles.streakFlame}>🔥</Text>
            </Pulse>
            <Text style={styles.streakCount}>{profile.streak}</Text>
          </View>
        </View>
      </FadeSlideIn>

      {/* XP / level card */}
      <FadeSlideIn delay={80} style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelTitle}>{lvl.title}</Text>
          <Text style={styles.levelXp}>
            LVL {lvl.level} · {profile.xp} XP
          </Text>
        </View>
        <AnimatedBar
          pct={lvl.intoLevel / lvl.toNext}
          color={C.cyan}
          trackColor={C.panelHi}
          height={8}
          delay={300}
        />
        <Text style={styles.xpToNext}>
          {lvl.toNext - lvl.intoLevel} XP to next level
        </Text>
      </FadeSlideIn>

      {/* Ticket queue */}
      <FadeSlideIn delay={160}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>▸ TICKET QUEUE</Text>
          <Pressable onPress={onRefreshQueue} hitSlop={12}>
            <Text style={styles.refresh}>↻ pull more</Text>
          </Pressable>
        </View>
      </FadeSlideIn>
      {queue.map((sc, index) => {
        const pri = PRIORITY[sc.priority];
        const best = profile.completed[sc.id];
        const title = easy ? sc.title : sc.hardTitle ?? sc.title;
        const blurb = easy ? sc.blurb : sc.hardBlurb ?? sc.blurb;
        return (
          <FadeSlideIn
            key={`${profile.queueNonce}-${sc.id}`}
            delay={ticketStartDelay + Math.min(index, 6) * 70}
          >
          <PressScale
            style={styles.ticket}
            onPress={() => onPlayScenario(sc)}
          >
            {sc.priority === 'P1' ? (
              <Pulse min={0.4} max={1} duration={620} style={[styles.stripe, { backgroundColor: pri.color }]} />
            ) : (
              <View style={[styles.stripe, { backgroundColor: pri.color }]} />
            )}
            <View style={styles.ticketBody}>
              <View style={styles.ticketMeta}>
                <View style={styles.ticketMetaLeft}>
                  <Text style={styles.ticketId}>{sc.ticket}</Text>
                  {easy && CATEGORY[sc.category] && (
                    <View style={styles.catChip}>
                      <Text style={styles.catChipText}>{CATEGORY[sc.category]}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.priLabel, { color: pri.color }]}>{pri.label}</Text>
              </View>
              <Text style={styles.ticketTitle}>{title}</Text>
              <Text style={styles.ticketClient}>{sc.client}</Text>
              <Text style={styles.ticketBlurb}>{blurb}</Text>
              {best != null && (
                <PopIn delay={ticketStartDelay + Math.min(index, 6) * 70 + 260} from={0.75}>
                  <Text style={styles.ticketDone}>
                    ✓ RESOLVED · best {best}/{sc.maxScore}
                  </Text>
                </PopIn>
              )}
            </View>
          </PressScale>
          </FadeSlideIn>
        );
      })}

      {/* Skill bites */}
      <FadeSlideIn delay={skillLabelDelay}>
        <Text style={styles.sectionLabel}>▸ SKILL BITES</Text>
      </FadeSlideIn>
      {BITE_DECKS.map((deck, index) => (
        <FadeSlideIn key={deck.id} delay={deckStartDelay + index * 70}>
        <PressScale
          style={styles.deck}
          onPress={() => onPlayDeck(deck)}
        >
          <Text style={styles.deckIcon}>⚡</Text>
          <View style={styles.deckBody}>
            <Text style={styles.deckTitle}>{deck.title}</Text>
            <Text style={styles.deckBlurb}>{deck.blurb}</Text>
            <Text style={styles.deckCount}>{deck.questions.length} questions</Text>
          </View>
        </PressScale>
        </FadeSlideIn>
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
  logoCursor: { color: C.green, fontFamily: mono },
  tagline: { color: C.faint, fontFamily: mono, fontSize: 11, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modePill: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modeText: { fontFamily: mono, fontSize: 11, fontWeight: 'bold' },
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
  streakFlameWrap: { marginRight: 6 },
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
  xpToNext: { color: C.faint, fontFamily: mono, fontSize: 11, marginTop: 8 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    color: C.dim,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  refresh: { color: C.blue, fontFamily: mono, fontSize: 12, marginBottom: 10, marginTop: 4 },
  ticket: {
    flexDirection: 'row',
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    marginBottom: 12,
    overflow: 'hidden',
  },
  stripe: { width: 5 },
  ticketBody: { flex: 1, padding: S.pad },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ticketMetaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketId: { color: C.faint, fontFamily: mono, fontSize: 12 },
  catChip: {
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  catChipText: { color: C.dim, fontFamily: mono, fontSize: 9, letterSpacing: 0.5 },
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
