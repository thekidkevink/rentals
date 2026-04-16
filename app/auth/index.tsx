import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';
import { usePreferences } from '../../src/providers/PreferencesProvider';

export default function AuthEntryScreen() {
  const router = useRouter();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [loading, router, user]);

  if (loading || user) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <LinearGradient colors={[palette.background, palette.heroStart, palette.heroEnd]} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Next step</Text>
        <Text style={styles.title}>Create your account to post and manage listings with confidence.</Text>
        <Text style={styles.body}>
          Your account keeps your listings tied to you, makes editing easier later, and gives you a personal view of what is currently live.
        </Text>

        <View style={styles.reasonBlock}>
          <Reason text="Publish rooms and flats under your account" />
          <Reason text="Track your own live listings in one place" />
          <Reason text="Return later without losing your posting history" />
        </View>
      </View>

      <View style={styles.actions}>
        <Link href="/auth/sign-up" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>Create account</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/auth/sign-in" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryLabel}>I already have an account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}

function Reason({ text }: { text: string }) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <View style={styles.reasonRow}>
      <View style={styles.reasonDot} />
      <Text style={styles.reasonText}>{text}</Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  card: {
    backgroundColor: palette.overlayCard,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.overlayBorder,
    padding: 24,
  },
  eyebrow: {
    color: palette.highlight,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginTop: 14,
  },
  body: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  reasonBlock: {
    gap: 12,
    marginTop: 24,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reasonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  reasonText: {
    color: palette.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  secondaryLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
