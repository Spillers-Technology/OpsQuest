import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, PRIORITY, mono, S } from '../theme';
import {
  TypeText,
  FadeSlideIn,
  PressScale,
  PopIn,
  Pulse,
  Shake,
  FlashEdge,
  FloatUp,
  CountUp,
  useTrigger,
  buzz,
} from '../ui/fx';

const QUALITY_COLOR = { best: C.green, ok: C.amber, bad: C.red };
const QUALITY_BUZZ = { best: 18, ok: 30, bad: [0, 70, 50, 70] };

export default function ScenarioScreen({ scenario, difficulty, onFinish, onQuit }) {
  const [nodeId, setNodeId] = useState(scenario.start);
  const [tech, setTech] = useState(0);
  const [people, setPeople] = useState(0);
  const [picked, setPicked] = useState(null); // choice object after selection, null while choosing
  const [typed, setTyped] = useState(false); // situation text fully revealed
  const [skip, setSkip] = useState(false); // user tapped to fast-forward the typewriter
  const [flash, bumpFlash] = useTrigger();
  const [techHit, bumpTech] = useTrigger();
  const [pplHit, bumpPpl] = useTrigger();
  const [flashColor, setFlashColor] = useState(C.green);
  const [delta, setDelta] = useState({ tech: 0, people: 0 });
  const scrollRef = useRef(null);

  const node = scenario.nodes[nodeId];
  const pri = PRIORITY[scenario.priority];
  const easy = difficulty === 'easy';
  const title = easy ? scenario.title : scenario.hardTitle ?? scenario.title;

  useEffect(() => {
    // Fresh node: back to the top
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [nodeId]);

  useEffect(() => {
    if (picked) scrollRef.current?.scrollToEnd({ animated: true });
  }, [picked]);

  const choose = (choice) => {
    setTech((t) => t + choice.tech);
    setPeople((p) => p + choice.people);
    setPicked(choice);
    setDelta({ tech: choice.tech, people: choice.people });
    setFlashColor(QUALITY_COLOR[choice.quality]);
    bumpFlash();
    if (choice.tech !== 0) bumpTech();
    if (choice.people !== 0) bumpPpl();
    buzz(QUALITY_BUZZ[choice.quality]);
  };

  const advance = () => {
    // Batch with the node switch so the fresh node types from scratch
    setNodeId(picked.next);
    setPicked(null);
    setTyped(false);
    setSkip(false);
  };

  return (
    <View style={styles.root}>
      <FlashEdge trigger={flash} color={flashColor} />

      {/* Ticket header */}
      <View style={[styles.header, { borderTopColor: pri.color }]}>
        <View style={styles.headerTop}>
          <Text style={styles.ticketId}>{scenario.ticket}</Text>
          {scenario.priority === 'P1' ? (
            <Pulse min={0.35} duration={650}>
              <Text style={[styles.priLabel, { color: pri.color }]}>{pri.label}</Text>
            </Pulse>
          ) : (
            <Text style={[styles.priLabel, { color: pri.color }]}>{pri.label}</Text>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.client}>{scenario.client}</Text>
        <View style={styles.tallyRow}>
          <View style={styles.tallyChip}>
            <Text style={[styles.tallyLabel, { color: C.cyan }]}>TECH</Text>
            <CountUp value={tech} duration={500} style={[styles.tallyValue, { color: C.cyan }]} />
            <FloatUp trigger={techHit} style={styles.floatDelta}>
              <Text style={[styles.deltaText, { color: delta.tech >= 0 ? C.cyan : C.red }]}>
                {delta.tech >= 0 ? '+' : ''}{delta.tech}
              </Text>
            </FloatUp>
          </View>
          <View style={styles.tallyChip}>
            <Text style={[styles.tallyLabel, { color: C.violet }]}>PEOPLE</Text>
            <CountUp value={people} duration={500} style={[styles.tallyValue, { color: C.violet }]} />
            <FloatUp trigger={pplHit} style={styles.floatDelta}>
              <Text style={[styles.deltaText, { color: delta.people >= 0 ? C.violet : C.red }]}>
                {delta.people >= 0 ? '+' : ''}{delta.people}
              </Text>
            </FloatUp>
          </View>
          <Pressable onPress={onQuit} hitSlop={16} style={styles.quitBtn}>
            <Text style={styles.quit}>✕ abandon</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        onContentSizeChange={() => {
          if (picked) scrollRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {/* Situation — types itself out; tap to fast-forward */}
        <Pressable onPress={() => setSkip(true)} disabled={typed}>
          <View style={styles.situation}>
            <TypeText
              key={nodeId}
              text={node.text}
              speed={200}
              instant={skip}
              onDone={() => setTyped(true)}
              style={styles.situationText}
              cursorColor={C.green}
            />
          </View>
        </Pressable>

        {/* Easy mode: the senior tech leans over your shoulder */}
        {typed && easy && !node.end && !picked && node.hint && (
          <FadeSlideIn dy={6} duration={240}>
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                <Text style={styles.hintTag}>⚐ HINT </Text>
                {node.hint}
              </Text>
            </View>
          </FadeSlideIn>
        )}

        {!typed ? (
          <Text style={styles.skipHint}>▸ tap the ticket to skip</Text>
        ) : node.end ? (
          <PopIn delay={150}>
            <PressScale style={styles.closeBtn} onPress={() => onFinish({ tech, people })}>
              <Text style={styles.closeBtnText}>CLOSE TICKET →</Text>
            </PressScale>
          </PopIn>
        ) : picked ? (
          <>
            {/* Ticket note: the teaching beat */}
            <Shake trigger={picked.quality === 'bad' ? flash : 0}>
              <FadeSlideIn dy={10} duration={260}>
                <View style={[styles.note, { borderLeftColor: QUALITY_COLOR[picked.quality] }]}>
                  <Text style={styles.noteHeader}>
                    ── ticket note ──{'  '}
                    <Text style={{ color: C.cyan }}>
                      TECH {picked.tech >= 0 ? '+' : ''}{picked.tech}
                    </Text>
                    {'  '}
                    <Text style={{ color: C.violet }}>
                      PPL {picked.people >= 0 ? '+' : ''}{picked.people}
                    </Text>
                  </Text>
                  <Text style={styles.noteChoice}>▸ {picked.label}</Text>
                  <FadeSlideIn delay={220} dy={6}>
                    <Text style={[styles.noteFeedback, { color: QUALITY_COLOR[picked.quality] }]}>
                      {picked.feedback}
                    </Text>
                  </FadeSlideIn>
                </View>
              </FadeSlideIn>
            </Shake>
            <FadeSlideIn delay={450} dy={8}>
              <PressScale style={styles.continueBtn} onPress={advance}>
                <Text style={styles.continueBtnText}>CONTINUE →</Text>
              </PressScale>
            </FadeSlideIn>
          </>
        ) : (
          node.choices.map((choice, i) => (
            <FadeSlideIn key={`${nodeId}-${i}`} delay={i * 120} dy={16}>
              <PressScale style={styles.choice} onPress={() => choose(choice)}>
                <Text style={styles.choiceText}>{choice.label}</Text>
                {easy && choice.hint && (
                  <Text style={styles.choiceHint}>› {choice.hint}</Text>
                )}
              </PressScale>
            </FadeSlideIn>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.panel,
    borderBottomColor: C.line,
    borderBottomWidth: 1,
    borderTopWidth: 4,
    paddingHorizontal: S.pad,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  ticketId: { color: C.faint, fontFamily: mono, fontSize: 12 },
  priLabel: { fontFamily: mono, fontSize: 12, fontWeight: 'bold' },
  title: { color: C.text, fontSize: 18, fontWeight: 'bold' },
  client: { color: C.dim, fontSize: 13, marginBottom: 10 },
  tallyRow: { flexDirection: 'row', alignItems: 'center' },
  tallyChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: C.panelHi,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  tallyLabel: { fontFamily: mono, fontSize: 10, marginRight: 6 },
  tallyValue: { fontFamily: mono, fontSize: 16, fontWeight: 'bold' },
  floatDelta: { position: 'absolute', right: 4, top: -14 },
  deltaText: { fontFamily: mono, fontSize: 14, fontWeight: 'bold' },
  quitBtn: { marginLeft: 'auto', paddingVertical: 8, paddingLeft: 8 },
  quit: { color: C.faint, fontFamily: mono, fontSize: 12 },

  body: { flex: 1 },
  bodyContent: { padding: S.pad, paddingBottom: 56 },
  situation: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: S.pad,
  },
  situationText: { color: C.text, fontSize: 15, lineHeight: 23 },
  skipHint: {
    color: C.faint,
    fontFamily: mono,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },

  hintBox: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: -6,
    marginBottom: S.pad,
  },
  hintTag: { color: C.amber, fontFamily: mono, fontSize: 11, fontWeight: 'bold' },
  hintText: { color: C.dim, fontSize: 12, lineHeight: 18 },

  choice: {
    backgroundColor: C.panelHi,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: 10,
  },
  choiceText: { color: C.text, fontSize: 14, lineHeight: 21 },
  choiceHint: { color: C.faint, fontSize: 12, lineHeight: 17, marginTop: 6, fontStyle: 'italic' },

  note: {
    backgroundColor: C.panel,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: S.pad,
    marginBottom: S.pad,
  },
  noteHeader: { color: C.faint, fontFamily: mono, fontSize: 11, marginBottom: 8 },
  noteChoice: { color: C.dim, fontSize: 13, fontStyle: 'italic', marginBottom: 8 },
  noteFeedback: { fontSize: 14, lineHeight: 21 },

  continueBtn: {
    backgroundColor: C.panelHi,
    borderColor: C.blue,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: C.blue, fontFamily: mono, fontSize: 14, fontWeight: 'bold' },

  closeBtn: {
    backgroundColor: C.green,
    borderRadius: S.radius,
    padding: 16,
    alignItems: 'center',
  },
  closeBtnText: { color: C.bg, fontFamily: mono, fontSize: 15, fontWeight: 'bold' },
});
