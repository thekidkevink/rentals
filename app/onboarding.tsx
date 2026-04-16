import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';
import { usePreferences } from '../src/providers/PreferencesProvider';

const slides = [
  {
    eyebrow: 'Search faster',
    title: 'Browse rentals by area, price, and type instead of waiting for referrals.',
    body: 'The first version is shaped around how people in Namibia already search, but without the noise and dead ends.',
  },
  {
    eyebrow: 'Trust the basics',
    title: 'See clear rent, deposit, move-in timing, and a direct WhatsApp contact path.',
    body: 'Good rental apps win by making small facts obvious. We want less guesswork and fewer wasted chats.',
  },
  {
    eyebrow: 'Post simply',
    title: 'Landlords and current tenants can publish live listings from a phone in minutes.',
    body: 'That keeps supply flowing and makes the app worth checking before Facebook Marketplace or status chains.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { user, loading } = useAuth();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [loading, router, user]);

  if (loading || user) {
    return <View style={styles.loadingScreen} />;
  }

  const slide = slides[index];
  const isLast = index === slides.length - 1;

  function handleNext() {
    if (isLast) {
      router.replace('/auth/sign-up');
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <LinearGradient colors={[palette.background, palette.heroStart, palette.heroEnd]} style={styles.screen}>
      <View style={styles.topRow}>
        <Text style={styles.progress}>
          {index + 1} / {slides.length}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/auth/sign-up')}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.illustration}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneCardLarge} />
            <View style={styles.phoneCardSmall} />
            <View style={styles.phoneCardSmall} />
          </View>
          <View style={styles.floatingTag}>
            <Text style={styles.floatingTagText}>N$3,200 | Room</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>

        <View style={styles.dots}>
          {slides.map((item, slideIndex) => (
            <View key={item.title} style={[styles.dot, slideIndex === index && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryLabel}>{isLast ? 'Continue to account' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progress: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  skip: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: palette.overlayCard,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: palette.overlayBorder,
    padding: 24,
  },
  illustration: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  phoneFrame: {
    width: 170,
    height: 220,
    backgroundColor: palette.illustrationFrame,
    borderWidth: 1,
    borderColor: palette.illustrationBorder,
    borderRadius: 28,
    padding: 16,
    gap: 12,
  },
  phoneCardLarge: {
    height: 82,
    borderRadius: 20,
    backgroundColor: palette.illustrationBlock,
  },
  phoneCardSmall: {
    height: 36,
    borderRadius: 14,
    backgroundColor: palette.illustrationBlockMuted,
  },
  floatingTag: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    backgroundColor: palette.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  floatingTagText: {
    color: palette.floatingLabel,
    fontWeight: '800',
    fontSize: 12,
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
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 14,
  },
  body: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.borderStrong,
  },
  dotActive: {
    width: 28,
    backgroundColor: palette.primary,
  },
  actions: {
    gap: 12,
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
