import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();

function canUseLocalStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

const webStorage: StorageAdapter = {
  async getItem(key) {
    if (canUseLocalStorage()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStorage.get(key) ?? null;
      }
    }

    return memoryStorage.get(key) ?? null;
  },
  async setItem(key, value) {
    memoryStorage.set(key, value);

    if (canUseLocalStorage()) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore browser storage failures and keep the in-memory fallback.
      }
    }
  },
  async removeItem(key) {
    memoryStorage.delete(key);

    if (canUseLocalStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore browser storage failures and keep the in-memory fallback.
      }
    }
  },
};

export const persistentStorage: StorageAdapter = Platform.OS === 'web' ? webStorage : AsyncStorage;
