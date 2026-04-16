import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './AuthProvider';
import { PreferencesProvider } from './PreferencesProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <AuthProvider>{children}</AuthProvider>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
