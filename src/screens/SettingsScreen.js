import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { C, mono, S } from '../theme';
import { FadeSlideIn, PressScale, buzz } from '../ui/fx';
import { syncRemote } from '../data/remote';

// Settings: difficulty toggle + optional content server. Readers need no
// account — paste the server URL, sync, done.
export default function SettingsScreen({ profile, onSetDifficulty, onSetContentUrl, onSynced, onBack }) {
  const [url, setUrl] = useState(profile.contentUrl ?? '');
  const [status, setStatus] = useState(null); // { ok, msg }
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const trimmed = url.trim().replace(/\/+$/, '');
    onSetContentUrl(trimmed || null);
    if (!trimmed) {
      setStatus({ ok: true, msg: 'server cleared — bundled tickets only' });
      return;
    }
    setBusy(true);
    setStatus({ ok: true, msg: 'syncing…' });
    const res = await syncRemote(trimmed);
    setBusy(false);
    if (res.ok) {
      buzz(18);
      setStatus({ ok: true, msg: `synced ${res.count} scenarios from server` });
      onSynced?.();
    } else {
      buzz([0, 70, 50, 70]);
      setStatus({ ok: false, msg: `sync failed: ${res.error} — using bundled + last cache` });
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <FadeSlideIn delay={0}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>── SETTINGS ──</Text>
          <Pressable onPress={onBack} hitSlop={16} style={styles.backBtn}>
            <Text style={styles.back}>✕</Text>
          </Pressable>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={80}>
        <Text style={styles.sectionLabel}>▸ TICKET DELIVERY</Text>
        <View style={styles.modeRow}>
          <PressScale
            style={[styles.modeBtn, profile.difficulty === 'easy' && { borderColor: C.green }]}
            onPress={() => onSetDifficulty('easy')}
          >
            <Text style={[styles.modeTitle, { color: C.green }]}>◐ ASSISTED</Text>
            <Text style={styles.modeSub}>tags + hints</Text>
          </PressScale>
          <PressScale
            style={[styles.modeBtn, profile.difficulty === 'hard' && { borderColor: C.red }]}
            onPress={() => onSetDifficulty('hard')}
          >
            <Text style={[styles.modeTitle, { color: C.red }]}>● REAL TECH</Text>
            <Text style={styles.modeSub}>raw queue, no help</Text>
          </PressScale>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={160}>
        <Text style={styles.sectionLabel}>▸ CONTENT SERVER (OPTIONAL)</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Point OpsQuest at a scenario server to pull extra tickets as they're published. No
            account needed. Offline or unreachable? The bundled set always works.
          </Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://opsquest.example.com"
            placeholderTextColor={C.faint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <PressScale style={styles.saveBtn} onPress={save} disabled={busy}>
            <Text style={styles.saveText}>{busy ? 'SYNCING…' : 'SAVE + SYNC'}</Text>
          </PressScale>
          {status && (
            <Text style={[styles.status, { color: status.ok ? C.green : C.red }]}>
              {status.ok ? '✓' : '✗'} {status.msg}
            </Text>
          )}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={240}>
        <PressScale style={styles.doneBtn} onPress={onBack}>
          <Text style={styles.doneText}>BACK TO QUEUE →</Text>
        </PressScale>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.pad, paddingTop: 24, paddingBottom: 56 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  header: { color: C.dim, fontFamily: mono, fontSize: 13, letterSpacing: 1, flex: 1 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  back: { color: C.faint, fontFamily: mono, fontSize: 16 },

  sectionLabel: {
    color: C.dim,
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: S.pad * 1.5 },
  modeBtn: {
    flex: 1,
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    alignItems: 'center',
  },
  modeTitle: { fontFamily: mono, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  modeSub: { color: C.faint, fontFamily: mono, fontSize: 11 },

  card: {
    backgroundColor: C.panel,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: S.pad,
    marginBottom: S.pad * 1.5,
  },
  cardText: { color: C.dim, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  input: {
    backgroundColor: C.panelHi,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 8,
    color: C.text,
    fontFamily: mono,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: C.panelHi,
    borderColor: C.blue,
    borderWidth: 1,
    borderRadius: S.radius,
    padding: 12,
    alignItems: 'center',
  },
  saveText: { color: C.blue, fontFamily: mono, fontSize: 13, fontWeight: 'bold' },
  status: { fontFamily: mono, fontSize: 12, marginTop: 10 },

  doneBtn: {
    backgroundColor: C.blue,
    borderRadius: S.radius,
    padding: 16,
    alignItems: 'center',
  },
  doneText: { color: C.bg, fontFamily: mono, fontSize: 15, fontWeight: 'bold' },
});
