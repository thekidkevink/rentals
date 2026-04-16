import { StyleSheet, Text, View } from 'react-native';

import { env } from '../lib/env';
import { palette } from '../theme/palette';

export function EnvStatusCard() {
  const configured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Environment status</Text>
      <Text style={styles.body}>
        {configured
          ? 'Supabase credentials are loaded from local environment variables, so we can wire live data safely.'
          : 'Supabase credentials are not loaded yet. Add them to .env.local before testing live data.'}
      </Text>
      <Text style={styles.status}>{configured ? 'Configured' : 'Missing setup'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    backgroundColor: palette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 20,
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  status: {
    color: palette.highlight,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
