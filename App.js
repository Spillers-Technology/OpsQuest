import React, { useEffect, useState, useCallback } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { C } from './src/theme';
import { getProfile, saveProfile, applyStreak } from './src/storage';
import HomeScreen from './src/screens/HomeScreen';
import ScenarioScreen from './src/screens/ScenarioScreen';
import DebriefScreen from './src/screens/DebriefScreen';
import BitesScreen, { XP_PER_CORRECT } from './src/screens/BitesScreen';

// Debrief converts ticket points to XP.
const XP_PER_POINT = 5;

export default function App() {
  const [profile, setProfile] = useState(null);
  // { name: 'home' | 'scenario' | 'bites' | 'debrief', scenario?, deck?, result?, xpGain? }
  const [screen, setScreen] = useState({ name: 'home' });

  useEffect(() => {
    (async () => {
      const p = applyStreak(await getProfile());
      await saveProfile(p);
      setProfile(p);
    })();
  }, []);

  const updateProfile = useCallback((mutate) => {
    setProfile((prev) => {
      const next = mutate(prev);
      saveProfile(next);
      return next;
    });
  }, []);

  const finishScenario = useCallback(
    (scenario, result) => {
      const combined = result.tech + result.people;
      const xpGain = Math.max(0, combined) * XP_PER_POINT;
      updateProfile((p) => ({
        ...p,
        xp: p.xp + xpGain,
        completed: {
          ...p.completed,
          [scenario.id]: Math.max(p.completed[scenario.id] ?? -Infinity, combined),
        },
      }));
      setScreen({ name: 'debrief', scenario, result, xpGain });
    },
    [updateProfile]
  );

  const finishDeck = useCallback(
    (correct) => {
      updateProfile((p) => ({ ...p, xp: p.xp + correct * XP_PER_CORRECT }));
    },
    [updateProfile]
  );

  if (!profile) {
    return <View style={styles.root} />;
  }

  let body;
  switch (screen.name) {
    case 'scenario':
      body = (
        <ScenarioScreen
          key={screen.runId}
          scenario={screen.scenario}
          onFinish={(result) => finishScenario(screen.scenario, result)}
          onQuit={() => setScreen({ name: 'home' })}
        />
      );
      break;
    case 'debrief':
      body = (
        <DebriefScreen
          scenario={screen.scenario}
          result={screen.result}
          xpGain={screen.xpGain}
          onReplay={() =>
            setScreen({ name: 'scenario', scenario: screen.scenario, runId: Date.now() })
          }
          onHome={() => setScreen({ name: 'home' })}
        />
      );
      break;
    case 'bites':
      body = (
        <BitesScreen
          key={screen.runId}
          deck={screen.deck}
          onFinish={finishDeck}
          onExit={() => setScreen({ name: 'home' })}
        />
      );
      break;
    default:
      body = (
        <HomeScreen
          profile={profile}
          onPlayScenario={(scenario) =>
            setScreen({ name: 'scenario', scenario, runId: Date.now() })
          }
          onPlayDeck={(deck) => setScreen({ name: 'bites', deck, runId: Date.now() })}
        />
      );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
