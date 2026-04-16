import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';
import { usePreferences } from '../src/providers/PreferencesProvider';

export default function WelcomeScreen() {
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
    <LinearGradient colors={[palette.heroStart, palette.heroEnd, palette.background]} style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Rentals Namibia</Text>
        <Text style={styles.title}>Find rooms, shared spaces, and flats in one clear mobile experience.</Text>
        <Text style={styles.body}>
          Discover available places, compare essentials quickly, and connect with posters through a simple rental flow built for Namibia.
        </Text>
      </View>

      <View style={styles.featureBlock}>
        <Feature text="See active listings in one feed" />
        <Feature text="Contact posters quickly on WhatsApp" />
        <Feature text="Post your own place in minutes" />
      </View>

      <View style={styles.actions}>
        <Link href="/onboarding" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryLabel}>Get started</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}

function Feature({ text }: { text: string }) {
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
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
  heroCard: {
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
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginTop: 14,
  },
  body: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  featureBlock: {
    gap: 14,
    marginTop: 26,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  featureDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  featureText: {
    color: palette.text,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    marginTop: 30,
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
});
