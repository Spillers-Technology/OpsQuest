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
import { ScreenIn } from './src/ui/fx';
import { SCENARIOS as BUNDLED_SCENARIOS } from './src/data/scenarios';
import { getCachedRemote, syncRemote, mergeScenarios } from './src/data/remote';
import HomeScreen from './src/screens/HomeScreen';
import ScenarioScreen from './src/screens/ScenarioScreen';
import DebriefScreen from './src/screens/DebriefScreen';
import BitesScreen, { XP_PER_CORRECT } from './src/screens/BitesScreen';
import DifficultyScreen from './src/screens/DifficultyScreen';
import SettingsScreen from './src/screens/SettingsScreen';

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
  const [scenarios, setScenarios] = useState(BUNDLED_SCENARIOS);
  // { name: 'home' | 'scenario' | 'bites' | 'debrief' | 'settings', scenario?, deck?, result?, xpGain? }
  const [screen, setScreen] = useState({ name: 'home' });

  const refreshContent = useCallback(async () => {
    const remote = await getCachedRemote();
    setScenarios(mergeScenarios(BUNDLED_SCENARIOS, remote));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let p = applyStreak(await getProfile());
        // New day: fresh queue seed
        const today = todayString();
        if (p.queueDay !== today) p = { ...p, queueDay: today, queueNonce: 0 };
        await saveProfile(p);
        setProfile(p);
        // Bundled content is the floor; merge in last cache, then re-sync quietly.
        await refreshContent();
        if (p.contentUrl) {
          syncRemote(p.contentUrl).then((res) => {
            if (res.ok) refreshContent();
          });
        }
      } catch (e) {
        setBootError(e);
      }
    })();
  }, [refreshContent]);

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
  if (!profile.difficulty) {
    // First open: choose Assisted vs Real Tech before the queue exists.
    body = (
      <DifficultyScreen
        onPick={(mode) => updateProfile((p) => ({ ...p, difficulty: mode }))}
      />
    );
    return (
      <AppErrorBoundary>
        <SafeAreaView style={styles.root}>
          <StatusBar style="light" />
          <ScreenIn key="difficulty">{body}</ScreenIn>
        </SafeAreaView>
      </AppErrorBoundary>
    );
  }
  switch (screen.name) {
    case 'scenario':
      body = (
        <ScenarioScreen
          key={screen.runId}
          scenario={screen.scenario}
          difficulty={profile.difficulty}
          onFinish={(result) => finishScenario(screen.scenario, result)}
          onQuit={() => setScreen({ name: 'home' })}
        />
      );
      break;
    case 'settings':
      body = (
        <SettingsScreen
          profile={profile}
          onSetDifficulty={(mode) => updateProfile((p) => ({ ...p, difficulty: mode }))}
          onSetContentUrl={(url) => updateProfile((p) => ({ ...p, contentUrl: url }))}
          onSynced={refreshContent}
          onBack={() => setScreen({ name: 'home' })}
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
          difficulty={profile.difficulty}
          onFinish={finishDeck}
          onExit={() => setScreen({ name: 'home' })}
        />
      );
      break;
    default:
      body = (
        <HomeScreen
          profile={profile}
          scenarios={scenarios}
          onPlayScenario={(scenario) =>
            setScreen({ name: 'scenario', scenario, runId: Date.now() })
          }
          onPlayDeck={(deck) => setScreen({ name: 'bites', deck, runId: Date.now() })}
          onRefreshQueue={() => updateProfile((p) => ({ ...p, queueNonce: p.queueNonce + 1 }))}
          onOpenSettings={() => setScreen({ name: 'settings' })}
        />
      );
  }

  return (
    <AppErrorBoundary>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <ScreenIn key={`${screen.name}-${screen.runId ?? ''}`}>{body}</ScreenIn>
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
