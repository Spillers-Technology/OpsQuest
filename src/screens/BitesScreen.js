import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, mono, S } from '../theme';

export const XP_PER_CORRECT = 10;

export default function BitesScreen({ deck, onFinish, onExit }) {
  const [index, setIndex] = useState(0);
  const [pickedIdx, setPickedIdx] = useState(null); // option index after answering
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const question = deck.questions[index];
  const last = index === deck.questions.length - 1;

  const pick = (i) => {
    if (pickedIdx !== null) return;
    setPickedIdx(i);
    if (i === question.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (last) {
      setDone(true);
      onFinish(correct); // award XP once, in App
    } else {
      setIndex((n) => n + 1);
      setPickedIdx(null);
    }
  };

  if (done) {
    return (
      <View style={[styles.root, styles.doneWrap]}>
        <Text style={styles.doneHeader}>── DECK COMPLETE ──</Text>
        <Text style={styles.doneScore}>
          {correct}
          <Text style={styles.doneMax}> / {deck.questions.length}</Text>
        </Text>
        <Text style={styles.doneXp}>+{correct * XP_PER_CORRECT} XP</Text>
        <Pressable style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitText}>BACK TO QUEUE →</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.deckTitle}>⚡ {deck.title}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.progress}>
            {index + 1}/{deck.questions.length}
          </Text>
          <Pressable onPress={onExit} hitSlop={16} style={styles.quitBtn}>
            <Text style={styles.quit}>✕</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.qCard}>
          <Text style={styles.qText}>{question.q}</Text>
        </View>

        {question.options.map((opt, i) => {
          const answered = pickedIdx !== null;
          const isAnswer = i === question.answer;
          const isPicked = i === pickedIdx;
          let border = C.line;
          let color = C.text;
          if (answered && isAnswer) {
            border = C.green;
            color = C.green;
          } else if (answered && isPicked) {
            border = C.red;
            color = C.red;
          } else if (answered) {
            color = C.faint;
          }
          return (
            <Pressable
              key={i}
              style={[styles.option, { borderColor: border }]}
              onPress={() => pick(i)}
              disabled={answered}
            >
              <Text style={[styles.optionText, { color }]}>{opt}</Text>
            </Pressable>
          );
        })}

        {pickedIdx !== null && (
          <>
            <View
              style={[
                styles.why,
                { borderLeftColor: pickedIdx === question.answer ? C.green : C.red },
              ]}
            >
              <Text style={styles.whyHeader}>
                {pickedIdx === question.answer ? '✓ CORRECT' : '✗ NOT QUITE'}
              </Text>
              <Text style={styles.whyText}>{question.why}</Text>
            </View>
            <Pressable style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextText}>{last ? 'FINISH →' : 'NEXT →'}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderBottomColor: C.line,
    borderBottomWidth: 1,
    padding: S.pad,
  },
  deckTitle: { color: C.text, fontSize: 15, fontWeight: 'bold', flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  progress: { color: C.dim, fontFamily: mono, fontSize: 13, marginRight: 14 },
  quitBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  quit: { color: C.faint, fontFamily: mono, fontSize: 16 },

  body: { flex: 1 },
  bodyContent: { padding: S.pad, paddingBottom: 56 },
  qCard: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: S.pad,
  },
  qText: { color: C.text, fontSize: 15, lineHeight: 23 },

  option: {
    backgroundColor: C.panelHi,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: 10,
  },
  optionText: { fontSize: 14, lineHeight: 20 },

  why: {
    backgroundColor: C.panel,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: S.pad,
    marginTop: 6,
    marginBottom: S.pad,
  },
  whyHeader: { color: C.dim, fontFamily: mono, fontSize: 11, marginBottom: 6 },
  whyText: { color: C.text, fontSize: 14, lineHeight: 21 },

  nextBtn: {
    backgroundColor: C.panelHi,
    borderColor: C.blue,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: 14,
    alignItems: 'center',
  },
  nextText: { color: C.blue, fontFamily: mono, fontSize: 14, fontWeight: 'bold' },

  doneWrap: { justifyContent: 'center', alignItems: 'center', padding: S.pad },
  doneHeader: { color: C.dim, fontFamily: mono, fontSize: 13, letterSpacing: 1, marginBottom: 16 },
  doneScore: { color: C.text, fontFamily: mono, fontSize: 48, fontWeight: 'bold' },
  doneMax: { color: C.faint, fontSize: 22 },
  doneXp: { color: C.green, fontFamily: mono, fontSize: 22, fontWeight: 'bold', marginVertical: 16 },
  exitBtn: {
    backgroundColor: C.blue,
    borderRadius: S.radius,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  exitText: { color: C.bg, fontFamily: mono, fontSize: 15, fontWeight: 'bold' },
});
