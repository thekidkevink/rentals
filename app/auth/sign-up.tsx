import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { signUpSchema } from '../../src/lib/authValidation';
import { usePreferences } from '../../src/providers/PreferencesProvider';
import { useAuth } from '../../src/providers/AuthProvider';

export default function SignUpScreen() {
  const router = useRouter();
  const { palette } = usePreferences();
  const styles = createStyles(palette);
  const { signUp, user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [router, user]);

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage('');
    setMessage('');

    try {
      const parsed = signUpSchema.safeParse({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        acceptedTerms,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Please review your details and try again.');
      }

      const result = await signUp(parsed.data.firstName, parsed.data.lastName, parsed.data.email, parsed.data.password, parsed.data.acceptedTerms);

      if (result.signedIn) {
        router.replace('/(tabs)');
        return;
      }

      setMessage('Account created. Check your email to confirm your address, then sign in once confirmation is complete.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[palette.background, palette.heroStart, palette.heroEnd]} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Create account</Text>
            <Text style={styles.title}>Start publishing and managing rentals from your own account.</Text>
            <Text style={styles.body}>
              Create your account to post listings, keep ownership of them, and return later with your rental history intact.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>First name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Tangeni"
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                  returnKeyType="next"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Last name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Example"
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                  returnKeyType="next"
                />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={palette.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
              returnKeyType="next"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Choose a secure password"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              autoComplete="password-new"
              style={styles.input}
              returnKeyType="next"
            />

            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={palette.textMuted}
              secureTextEntry
              autoComplete="password-new"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            <TouchableOpacity style={styles.termsRow} onPress={() => setAcceptedTerms((current) => !current)}>
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms ? <View style={styles.checkboxInner} /> : null}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Link href="/legal/terms" style={styles.termsLink}>
                  Terms and Conditions
                </Link>
                .
              </Text>
            </TouchableOpacity>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            {message ? <Text style={styles.success}>{message}</Text> : null}

            <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.primaryLabel}>{loading ? 'Creating account...' : 'Create account'}</Text>
            </TouchableOpacity>

            <Link href="/auth/sign-in" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryLabel}>I already have an account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = (palette: ReturnType<typeof usePreferences>['palette']) => StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 36,
    gap: 20,
    flexGrow: 1,
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
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
  termsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: palette.floatingLabel,
  },
  termsText: {
    color: palette.textMuted,
    flex: 1,
    lineHeight: 22,
  },
  termsLink: {
    color: palette.text,
    fontWeight: '700',
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
