import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { signInSchema } from '../../src/lib/authValidation';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { useAuth } from '../../src/providers/AuthProvider';

export default function SignInScreen() {
  const router = useRouter();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const parsed = signInSchema.safeParse({ email, password });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Please review your sign-in details.');
      }

      await signIn(parsed.data.email, parsed.data.password);
      setMessage('Signed in successfully.');
      router.replace('/post');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[palette.background, palette.heroStart, palette.heroEnd]} style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Sign in</Text>
        <Text style={styles.title}>Welcome back. Pick up your listings where you left them.</Text>
        <Text style={styles.body}>
          Sign in with the email and password linked to your account to post, edit, and manage your live rental listings.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={palette.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor={palette.textMuted}
          secureTextEntry
          style={styles.input}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryLabel}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </TouchableOpacity>

        <Link href="/auth/sign-up" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryLabel}>Create a new account</Text>
          </TouchableOpacity>
        </Link>
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
  heroCard: {
    backgroundColor: palette.overlayCard,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.overlayBorder,
    padding: 24,
  },
  eyebrow: {
    color: palette.highlight,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
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
  formCard: {
    backgroundColor: palette.overlayCard,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: palette.overlayBorder,
    padding: 24,
  },
  label: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
  },
  error: {
    color: '#FF9D8A',
    marginTop: 16,
    lineHeight: 20,
  },
  success: {
    color: '#8BE0A8',
    marginTop: 16,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: palette.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    color: palette.text,
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  secondaryLabel: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
