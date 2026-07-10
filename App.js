import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar as NativeStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { C } from './src/theme';
import {
  getProfile,
  saveProfile,
  applyStreak,
  todayString,
  DAILY_FIRST_TICKET_XP,
} from './src/storage';
import HomeScreen from './src/screens/HomeScreen';
import ScenarioScreen from './src/screens/ScenarioScreen';
import DebriefScreen from './src/screens/DebriefScreen';
import BitesScreen, { XP_PER_CORRECT } from './src/screens/BitesScreen';

// Debrief converts ticket points to XP.
const XP_PER_POINT = 5;

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <StartupError message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

function StartupError({ message }) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>OpsQuest hit a startup error.</Text>
        <Text style={styles.errorText}>{message || 'Restart the app and try again.'}</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [bootError, setBootError] = useState(null);
  // { name: 'home' | 'scenario' | 'bites' | 'debrief', scenario?, deck?, result?, xpGain? }
  const [screen, setScreen] = useState({ name: 'home' });

  useEffect(() => {
    (async () => {
      try {
        const p = applyStreak(await getProfile());
        await saveProfile(p);
        setProfile(p);
      } catch (e) {
        setBootError(e);
      }
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
      const today = todayString();
      const dailyBonus = profile.lastTicketDay === today ? 0 : DAILY_FIRST_TICKET_XP;
      const xpGain = Math.max(0, combined) * XP_PER_POINT + dailyBonus;
      updateProfile((p) => ({
        ...p,
        xp: p.xp + xpGain,
        lastTicketDay: today,
        completed: {
          ...p.completed,
          [scenario.id]: Math.max(p.completed[scenario.id] ?? -Infinity, combined),
        },
      }));
      setScreen({ name: 'debrief', scenario, result, xpGain, dailyBonus });
    },
    [profile, updateProfile]
  );

  const finishDeck = useCallback(
    (correct) => {
      updateProfile((p) => ({ ...p, xp: p.xp + correct * XP_PER_CORRECT }));
    },
    [updateProfile]
  );

  if (bootError) {
    return <StartupError message={bootError.message} />;
  }

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
          dailyBonus={screen.dailyBonus}
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
    <AppErrorBoundary>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        {body}
      </SafeAreaView>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    // RN's SafeAreaView is iOS-only; on Android the app draws edge-to-edge
    // under the translucent status bar, so inset the whole tree below it.
    paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0,
  },
  errorCard: {
    margin: 16,
    padding: 16,
    backgroundColor: C.panel,
    borderColor: C.red,
    borderWidth: 1,
    borderRadius: 14,
  },
  errorTitle: { color: C.red, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorText: { color: C.text, fontSize: 14, lineHeight: 20 },
});
