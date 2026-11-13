import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiOrigin } from "../lib/env";
import { colors, spacing } from "../lib/theme";

type BackendState = "checking" | "reachable" | "unreachable";

const stateLabel: Record<BackendState, string> = {
  checking: "Ověřuji spojení se serverem…",
  reachable: "Server je dostupný.",
  unreachable: "Server není dostupný.",
};

// Placeholder entry that proves the app starts and reaches the backend; product screens come in a later milestone.
export default function Index() {
  const [backend, setBackend] = useState<BackendState>("checking");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Better Auth's health endpoint: public and session-free, but rate-limited, so it also proves the database answers.
    fetch(`${apiOrigin}/api/auth/ok`, { signal: controller.signal })
      .then((response) => setBackend(response.ok ? "reachable" : "unreachable"))
      .catch(() => setBackend("unreachable"))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Investník</Text>
        <Text style={styles.body}>Mobilní aplikace se připravuje.</Text>
        <Text accessibilityLiveRegion="polite" style={[styles.body, backend === "unreachable" && styles.error]}>
          {stateLabel[backend]}
        </Text>
        {__DEV__ ? <Text style={styles.meta}>{apiOrigin}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", gap: spacing.sm, paddingHorizontal: spacing.gutter },
  title: { fontSize: 28, fontWeight: "600", letterSpacing: -0.8, color: colors.foreground },
  body: { fontSize: 16, lineHeight: 24, color: colors.foreground },
  error: { color: colors.danger },
  meta: { fontSize: 13, color: colors.muted },
});
