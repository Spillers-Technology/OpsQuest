import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, mono, S } from '../theme';
import {
  AnimatedBar,
  CountUp,
  FadeSlideIn,
  FlashEdge,
  PopIn,
  PressScale,
  Shake,
  useTrigger,
  buzz,
} from '../ui/fx';

export const XP_PER_CORRECT = 10;

export default function BitesScreen({ deck, difficulty, onFinish, onExit }) {
  const [index, setIndex] = useState(0);
  const [pickedIdx, setPickedIdx] = useState(null); // option index after answering
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, bumpFlash] = useTrigger();

  const question = deck.questions[index];
  const last = index === deck.questions.length - 1;
  const wasRight = pickedIdx === question.answer;

  const pick = (i) => {
    if (pickedIdx !== null) return;
    setPickedIdx(i);
    bumpFlash();
    if (i === question.answer) {
      setCorrect((c) => c + 1);
      buzz(18);
    } else {
      buzz([0, 70, 50, 70]);
    }
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
        <FadeSlideIn delay={0}>
          <Text style={styles.doneHeader}>── DECK COMPLETE ──</Text>
        </FadeSlideIn>
        <PopIn delay={200} from={0.4}>
          <Text style={styles.doneScore}>
            <CountUp value={correct} duration={700} delay={300} style={styles.doneScore} />
            <Text style={styles.doneMax}> / {deck.questions.length}</Text>
          </Text>
        </PopIn>
        <PopIn delay={1050} from={0.6}>
          <CountUp
            value={correct * XP_PER_CORRECT}
            duration={500}
            delay={1150}
            prefix="+"
            suffix=" XP"
            style={styles.doneXp}
          />
        </PopIn>
        <FadeSlideIn delay={1500} dy={12}>
          <PressScale style={styles.exitBtn} onPress={onExit}>
            <Text style={styles.exitText}>BACK TO QUEUE →</Text>
          </PressScale>
        </FadeSlideIn>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlashEdge trigger={flash} color={wasRight ? C.green : C.red} />

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
      <AnimatedBar
        pct={(index + (pickedIdx !== null ? 1 : 0)) / deck.questions.length}
        color={C.blue}
        trackColor={C.panelHi}
        height={3}
        radius={0}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <FadeSlideIn key={`q-${index}`} dy={18} duration={280}>
          <View style={styles.qCard}>
            <Text style={styles.qText}>{question.q}</Text>
            {difficulty === 'easy' && question.hint && pickedIdx === null && (
              <Text style={styles.qHint}>
                <Text style={styles.qHintTag}>⚐ HINT </Text>
                {question.hint}
              </Text>
            )}
          </View>
        </FadeSlideIn>

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
          const option = (
            <PressScale
              style={[styles.option, { borderColor: border }]}
              onPress={() => pick(i)}
              disabled={answered}
            >
              <Text style={[styles.optionText, { color }]}>{opt}</Text>
            </PressScale>
          );
          return (
            <FadeSlideIn key={`${index}-${i}`} delay={120 + i * 80} dy={14}>
              {/* Wrong pick rattles; the real answer pops so the eye lands on it */}
              {answered && isPicked && !isAnswer ? (
                <Shake trigger={flash}>{option}</Shake>
              ) : answered && isAnswer ? (
                <PopIn from={0.96}>{option}</PopIn>
              ) : (
                option
              )}
            </FadeSlideIn>
          );
        })}

        {pickedIdx !== null && (
          <>
            <FadeSlideIn delay={150} dy={10}>
              <View style={[styles.why, { borderLeftColor: wasRight ? C.green : C.red }]}>
                <PopIn delay={150} from={0.6}>
                  <Text style={[styles.whyHeader, { color: wasRight ? C.green : C.red }]}>
                    {wasRight ? '✓ CORRECT' : '✗ NOT QUITE'}
                  </Text>
                </PopIn>
                <Text style={styles.whyText}>{question.why}</Text>
              </View>
            </FadeSlideIn>
            <FadeSlideIn delay={420} dy={8}>
              <PressScale style={styles.nextBtn} onPress={next}>
                <Text style={styles.nextText}>{last ? 'FINISH →' : 'NEXT →'}</Text>
              </PressScale>
            </FadeSlideIn>
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
  qHint: { color: C.dim, fontSize: 12, lineHeight: 18, marginTop: 10 },
  qHintTag: { color: C.amber, fontFamily: mono, fontSize: 11, fontWeight: 'bold' },

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
  whyHeader: { fontFamily: mono, fontSize: 11, marginBottom: 6 },
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
