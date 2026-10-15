// Shared UI kit: tiles, stat bars, buttons, tags, count-up numbers.
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { formatEuro } from "@/src/game/format";
import { fonts, makeStyles, useTheme } from "@/src/theme";

export const Icon = MaterialDesignIcons;

export function Card({ children, style, testID }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; testID?: string }>) {
  const s = useStyles();
  return (
    <View testID={testID} style={[s.card, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }: PropsWithChildren<{ right?: React.ReactNode }>) {
  const s = useStyles();
  return (
    <View style={s.sectionRow}>
      <Text style={s.section}>{children}</Text>
      {right}
    </View>
  );
}

export function Label({ children }: PropsWithChildren) {
  const s = useStyles();
  return <Text style={s.label}>{children}</Text>;
}

export function Mono({ children, style, testID }: PropsWithChildren<{ style?: any; testID?: string }>) {
  const s = useStyles();
  return (
    <Text testID={testID} style={[s.mono, style]}>
      {children}
    </Text>
  );
}

type Tone = "brand" | "success" | "warning" | "error" | "muted" | "info";

export function Tag({ text, tone = "muted", icon, testID }: { text: string; tone?: Tone; icon?: any; testID?: string }) {
  const { colors } = useTheme();
  const s = useStyles();
  const c = colors[tone];
  return (
    <View testID={testID} style={[s.tag, { borderColor: c }]}>
      {icon ? <Icon name={icon} size={12} color={c} /> : null}
      <Text style={[s.tagText, { color: c }]}>{text}</Text>
    </View>
  );
}

export function StatBar({ label, value, tone = "brand", testID, icon }: { label: string; value: number; tone?: Tone; testID?: string; icon?: any }) {
  const { colors } = useTheme();
  const s = useStyles();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(100, value)), { duration: 500 });
  }, [value, w]);
  const anim = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return (
    <View testID={testID} style={s.statWrap}>
      <View style={s.statHead}>
        <View style={s.row}>
          {icon ? <Icon name={icon} size={14} color={colors.muted} /> : null}
          <Text style={s.label}>{label}</Text>
        </View>
        <Text style={s.statVal}>{Math.round(value)}</Text>
      </View>
      <View style={s.track}>
        <Animated.View style={[s.fill, { backgroundColor: colors[tone] }, anim]} />
      </View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  icon,
  testID,
  sub,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  icon?: any;
  testID?: string;
  sub?: string;
}) {
  const { colors } = useTheme();
  const s = useStyles();
  const bg = variant === "primary" ? colors.brand : variant === "danger" ? colors.error : "transparent";
  const fg = variant === "primary" ? colors.onBrand : variant === "danger" ? colors.onError : colors.brand;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderColor: variant === "ghost" ? colors.borderStrong : bg },
        disabled && s.disabled,
        pressed && !disabled && s.pressed,
      ]}
    >
      <View style={s.row}>
        {icon ? <Icon name={icon} size={18} color={fg} /> : null}
        <Text style={[s.btnText, { color: fg }]}>{title}</Text>
      </View>
      {sub ? <Text style={[s.btnSub, { color: fg }]}>{sub}</Text> : null}
    </Pressable>
  );
}

// Counts up/down to `cents` whenever it changes. Purely visual: the booking
// already happened in the engine, so an interrupted animation changes nothing.
export function CountUpEuro({ cents, style, testID }: { cents: number; style?: any; testID?: string }) {
  const [shown, setShown] = useState(cents);
  const from = useRef(cents);
  useEffect(() => {
    const start = from.current;
    const diff = cents - start;
    if (diff === 0) return;
    const t0 = Date.now();
    const dur = 700;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(start + diff * eased));
      if (p >= 1) {
        clearInterval(id);
        from.current = cents;
      }
    }, 16);
    return () => {
      clearInterval(id);
      from.current = cents;
      setShown(cents);
    };
  }, [cents]);
  return (
    <Text testID={testID} style={style}>
      {formatEuro(shown)}
    </Text>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surfaceSecondary,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 8 },
  section: { color: c.onSurface, fontFamily: fonts.displayBold, fontSize: 20, letterSpacing: 1, textTransform: "uppercase" },
  label: { color: c.muted, fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" },
  mono: { color: c.onSurface, fontFamily: fonts.mono, fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" },
  tagText: { fontFamily: fonts.mono, fontSize: 10, textTransform: "uppercase" },
  statWrap: { gap: 6 },
  statHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statVal: { color: c.onSurface, fontFamily: fonts.monoBold, fontSize: 13 },
  track: { height: 6, backgroundColor: c.surfaceTertiary, borderRadius: 2, overflow: "hidden" },
  fill: { height: 6, borderRadius: 2 },
  btn: { minHeight: 48, borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: fonts.displayBold, fontSize: 16, letterSpacing: 1, textTransform: "uppercase" },
  btnSub: { fontFamily: fonts.mono, fontSize: 10, marginTop: 2, opacity: 0.85 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
}));
