import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePreferences } from '../../src/providers/PreferencesProvider';

const sections = [
  {
    title: 'Use of the app',
    body: 'You agree to provide accurate rental information, keep your contact details current, and avoid posting misleading, unlawful, or fraudulent listings.',
  },
  {
    title: 'Listing responsibility',
    body: 'You remain responsible for the listings you publish, the pricing you share, and the conversations you start with potential renters or landlords.',
  },
  {
    title: 'Safety and moderation',
    body: 'We may remove listings or accounts that appear abusive, deceptive, duplicated, unsafe, or in breach of these terms.',
  },
  {
    title: 'Local judgment',
    body: 'The app helps connect people, but users should still verify availability, inspect places, and use their own judgment before making commitments.',
  },
];

export default function TermsScreen() {
  const router = useRouter();
  const { palette } = usePreferences();
  const styles = createStyles(palette);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonLabel}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.eyebrow}>Legal</Text>
      <Text style={styles.title}>Terms and Conditions</Text>
      <Text style={styles.body}>
        These starter terms support the first release of the app and explain the basic expectations around accounts, listings, and responsible use.
      </Text>

      <View style={styles.card}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  backButtonLabel: {
    color: palette.text,
    fontWeight: '700',
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
  card: {
    marginTop: 24,
    backgroundColor: palette.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionBody: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
});
