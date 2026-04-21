import "react-native-url-polyfill/auto";

import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

import { env } from "./env";
import { persistentStorage } from "./persistentStorage";

const fallbackUrl = "https://vdfablahkudzpwhqmwnp.supabase.co";
const fallbackKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZmFibGFoa3VkenB3aHFtd25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDY3MjYsImV4cCI6MjA5MTgyMjcyNn0.sywSu7npkFL_XfkYyja0yHxJhT12TTWd2KvlAyxELOI";
const canUseBrowserSessionFeatures =
  Platform.OS !== "web" || typeof window !== "undefined";

export const supabase = createClient(
  env.supabaseUrl || fallbackUrl,
  env.supabaseAnonKey || fallbackKey,
  {
    auth: {
      storage: persistentStorage,
      autoRefreshToken: canUseBrowserSessionFeatures,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
