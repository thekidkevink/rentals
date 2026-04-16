# Rentals

Mobile-first rental marketplace MVP for Namibia, built with Expo, React Native, Expo Router, and Supabase.

## What is included

- Expo Router app shell with five primary tabs
- Home, search, listing details, posting, my listings, and profile screens
- Supabase client configured for Expo with AsyncStorage
- Live-data fallback to starter mock listings while the database tables are still being created
- Local environment setup through `.env.local`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Confirm your Supabase values in `.env.local`.

3. Start the app:

```bash
npm run start
```

4. Open it in Expo Go on Android.

## Recommended next backend steps

Run the migration flow from the terminal once the Supabase CLI is installed cleanly on Windows:

```bash
npm run supabase:login
npm run supabase:link
npm run supabase:push
```

The project is already configured to link against project ref `vdfablahkudzpwhqmwnp`.

## Suggested next app steps

- Add Supabase auth with phone or email sign-in
- Replace image URLs with real photo uploads to Supabase Storage
- Add row level security and poster ownership rules
- Replace placeholder profile and post flows with live data
