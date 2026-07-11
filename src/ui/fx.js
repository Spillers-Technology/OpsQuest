import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, Vibration } from 'react-native';

// Ops Quest motion kit — built-in Animated only (no native deps, per HANDOFF guardrails).
// Everything transform/opacity runs on the native driver; bars animate width on JS.

export function buzz(pattern) {
  // Fire-and-forget haptic; silently no-ops where unsupported (iOS ignores patterns).
  try {
    Vibration.vibrate(pattern ?? 30);
  } catch {}
}

// Mount entrance: fade in while sliding from `dy` px below (or dx from the side).
export function FadeSlideIn({ delay = 0, dy = 14, dx = 0, duration = 320, style, children }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [t, delay, duration]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t,
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) },
            { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [dx, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Pressable that springs down on touch — makes every tap feel physical.
export function PressScale({ style, children, scaleTo = 0.965, onPressIn, onPressOut, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        Animated.spring(scale, {
          toValue: scaleTo,
          speed: 40,
          bounciness: 0,
          useNativeDriver: true,
        }).start();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        Animated.spring(scale, {
          toValue: 1,
          speed: 20,
          bounciness: 8,
          useNativeDriver: true,
        }).start();
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Endless soft pulse — status lights, P1 stripes, the streak flame.
export function Pulse({ min = 0.55, max = 1, duration = 900, scale = false, style, children }) {
  const t = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);
  const v = t.interpolate({ inputRange: [0, 1], outputRange: [min, max] });
  return (
    <Animated.View style={[style, scale ? { transform: [{ scale: v }] } : { opacity: v }]}>
      {children}
    </Animated.View>
  );
}

// Horizontal shake whenever `trigger` changes to a truthy new value (pass a counter).
export function Shake({ trigger, intensity = 7, style, children }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    x.setValue(0);
    Animated.sequence(
      [intensity, -intensity, intensity * 0.7, -intensity * 0.7, intensity * 0.35, 0].map((to) =>
        Animated.timing(x, { toValue: to, duration: 45, useNativeDriver: true })
      )
    ).start();
  }, [trigger, x, intensity]);
  return (
    <Animated.View style={[style, { transform: [{ translateX: x }] }]}>{children}</Animated.View>
  );
}

// Pop-in with overshoot: for stamps, scores, "correct!" beats.
export function PopIn({ delay = 0, from = 0.3, style, children }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(t, {
      toValue: 1,
      delay,
      speed: 14,
      bounciness: 14,
      useNativeDriver: true,
    }).start();
  }, [t, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Number that counts up to `value`. Re-animates when `value` changes.
export function CountUp({ value, duration = 700, delay = 0, style, prefix = '', suffix = '' }) {
  const anim = useRef(new Animated.Value(0)).current;
  const fromRef = useRef(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const from = fromRef.current;
    const id = anim.addListener(({ value: t }) => {
      setShown(Math.round(from + (value - from) * t));
    });
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      fromRef.current = value;
      setShown(value);
    });
    return () => anim.removeListener(id);
  }, [value, anim, duration, delay]);
  return (
    <Text style={style}>
      {prefix}
      {shown}
      {suffix}
    </Text>
  );
}

// Terminal typewriter. Reveals `text` in chunks; set `instant` to finish immediately.
// Fires onDone once fully revealed (including the instant path).
export function TypeText({ text, speed = 220, instant = false, onDone, style, cursorColor }) {
  const [count, setCount] = useState(instant ? text.length : 0);
  const doneRef = useRef(false);
  const done = count >= text.length;

  useEffect(() => {
    setCount(instant ? text.length : 0);
    doneRef.current = false;
  }, [text]);

  useEffect(() => {
    if (instant) {
      setCount(text.length);
      return;
    }
    if (done) return;
    const chunk = Math.max(1, Math.round(speed / 30));
    const id = setInterval(() => {
      setCount((c) => Math.min(text.length, c + chunk));
    }, 1000 / 30);
    return () => clearInterval(id);
  }, [text, instant, done, speed]);

  useEffect(() => {
    if (done && !doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  }, [done, onDone]);

  return (
    <Text style={style}>
      {text.slice(0, count)}
      {!done && <Text style={{ color: cursorColor ?? undefined }}>▋</Text>}
    </Text>
  );
}

// Blinking terminal cursor (hard blink, no fade — it's a NOC console, not a spa).
export function Cursor({ style, char = '▋', period = 530 }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), period);
    return () => clearInterval(id);
  }, [period]);
  return <Text style={[style, { opacity: on ? 1 : 0 }]}>{char}</Text>;
}

// Progress bar that springs to `pct` (0..1) whenever it changes.
export function AnimatedBar({ pct, color, height = 8, delay = 0, trackColor, radius = 4 }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(w, {
      toValue: Math.max(0, Math.min(1, pct)),
      delay,
      speed: 4,
      bounciness: 4,
      useNativeDriver: false,
    }).start();
  }, [pct, w, delay]);
  return (
    <Animated.View
      style={{ height, backgroundColor: trackColor, borderRadius: radius, overflow: 'hidden' }}
    >
      <Animated.View
        style={{
          height,
          borderRadius: radius,
          backgroundColor: color,
          width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </Animated.View>
  );
}

// Full-screen edge glow that flashes `color` when `trigger` changes (pass a counter).
// Mount once near the root of a screen, absolutely positioned, pointerEvents none.
export function FlashEdge({ trigger, color, thickness = 4 }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    t.setValue(0);
    Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(t, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [trigger, t]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderColor: color, borderWidth: thickness, opacity: t, zIndex: 99 },
      ]}
    />
  );
}

// Score delta ("+2") that pops up, floats, and fades. Keyed by `trigger` counter.
export function FloatUp({ trigger, style, children, distance = 26 }) {
  const t = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: 950,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, [trigger, t]);
  if (!visible) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          opacity: t.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [4, -distance] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Screen-level transition wrapper: fade + rise on mount. Key it by screen identity.
export function ScreenIn({ children }) {
  return (
    <FadeSlideIn dy={18} duration={260} style={{ flex: 1 }}>
      {children}
    </FadeSlideIn>
  );
}

// Hook: returns [counter, bump] — feed the counter to Shake/FlashEdge/FloatUp triggers.
export function useTrigger() {
  const [n, setN] = useState(0);
  const bump = useCallback(() => setN((v) => v + 1), []);
  return [n, bump];
}
