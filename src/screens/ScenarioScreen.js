import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, PRIORITY, mono, S } from '../theme';

const QUALITY_COLOR = { best: C.green, ok: C.amber, bad: C.red };

export default function ScenarioScreen({ scenario, onFinish, onQuit }) {
  const [nodeId, setNodeId] = useState(scenario.start);
  const [tech, setTech] = useState(0);
  const [people, setPeople] = useState(0);
  const [picked, setPicked] = useState(null); // choice object after selection, null while choosing
  const scrollRef = useRef(null);

  const node = scenario.nodes[nodeId];
  const pri = PRIORITY[scenario.priority];

  useEffect(() => {
    // New node or fresh feedback: bring it into view
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [nodeId, picked]);

  const choose = (choice) => {
    setTech((t) => t + choice.tech);
    setPeople((p) => p + choice.people);
    setPicked(choice);
  };

  const advance = () => {
    setNodeId(picked.next);
    setPicked(null);
  };

  return (
    <View style={styles.root}>
      {/* Ticket header */}
      <View style={[styles.header, { borderTopColor: pri.color }]}>
        <View style={styles.headerTop}>
          <Text style={styles.ticketId}>{scenario.ticket}</Text>
          <Text style={[styles.priLabel, { color: pri.color }]}>{pri.label}</Text>
        </View>
        <Text style={styles.title}>{scenario.title}</Text>
        <Text style={styles.client}>{scenario.client}</Text>
        <View style={styles.tallyRow}>
          <View style={styles.tallyChip}>
            <Text style={[styles.tallyLabel, { color: C.cyan }]}>TECH</Text>
            <Text style={[styles.tallyValue, { color: C.cyan }]}>{tech}</Text>
          </View>
          <View style={styles.tallyChip}>
            <Text style={[styles.tallyLabel, { color: C.violet }]}>PEOPLE</Text>
            <Text style={[styles.tallyValue, { color: C.violet }]}>{people}</Text>
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
      >
        {/* Situation */}
        <View style={styles.situation}>
          <Text style={styles.situationText}>{node.text}</Text>
        </View>

        {node.end ? (
          <Pressable style={styles.closeBtn} onPress={() => onFinish({ tech, people })}>
            <Text style={styles.closeBtnText}>CLOSE TICKET →</Text>
          </Pressable>
        ) : picked ? (
          <>
            {/* Ticket note: the teaching beat */}
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
              <Text style={[styles.noteFeedback, { color: QUALITY_COLOR[picked.quality] }]}>
                {picked.feedback}
              </Text>
            </View>
            <Pressable style={styles.continueBtn} onPress={advance}>
              <Text style={styles.continueBtnText}>CONTINUE →</Text>
            </Pressable>
          </>
        ) : (
          node.choices.map((choice, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
              onPress={() => choose(choice)}
            >
              <Text style={styles.choiceText}>{choice.label}</Text>
            </Pressable>
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

  choice: {
    backgroundColor: C.panelHi,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: 10,
  },
  choicePressed: { borderColor: C.blue },
  choiceText: { color: C.text, fontSize: 14, lineHeight: 21 },

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
