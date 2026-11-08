# SummitSync app

Expo (React Native) client for [SummitSync](https://github.com/fokukac/SummitSync_BE): Android first, web from the same code,
iOS later. It talks to the backend's `/api/v1` (Sanctum bearer tokens, OpenAPI docs at `/docs/api`).

## Run it

```bash
npm install
cp .env.example .env        # EXPO_PUBLIC_API_URL = your backend (Sail serves on http://localhost)
npm run web                 # http://localhost:8081
npm run android             # emulator or device; reaches the host as http://10.0.2.2 by default
```

Demo login (backend `DemoSeeder`): `alice@example.test` / `password`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run check` | lint + type check + tests (what CI runs) |
| `npm run sync:backend` | re-export the OpenAPI spec, regenerate `src/api/schema.d.ts`, copy the website's translation catalogs |
| `npm run build:web` | static web build into `dist/` |

Always add packages with `npx expo install <pkg>` (it picks the SDK-compatible version). Dependencies install with
`legacy-peer-deps` (see `.npmrc`): `openapi-typescript` has not declared TypeScript 6 support yet.

## Shared with the backend (never edit by hand)

- `src/api/openapi.json` and `src/api/schema.d.ts`: the API contract. After any backend API change run `npm run sync:backend`;
  type errors then show exactly what the app must adapt.
- `src/i18n/locales/*`: the website's `en`/`hu`/`ro` catalogs. New UI strings are added in the backend repo (all three
  languages), then synced. `__tests__/i18n.test.ts` checks the catalogs stay complete.

## Layout

- `src/app`: Expo Router routes. Three states, three groups: `(auth)` (signed out), `verify-email` (signed in, unverified),
  `(app)` (signed in and verified); `Stack.Protected` in `_layout.tsx` switches between them.
- `src/api/client.ts`: typed client (`openapi-fetch`); adds the bearer token and `Accept-Language`, signs out on a 401.
- `src/auth`: token in the platform keystore (`expo-secure-store`; `localStorage` on web), sign in/up, two-factor step.
- `src/i18n`: the website's message format, device language by default, choice remembered.

## Roadmap

1. Foundation: auth, i18n, API client, CI. 2. Read paths (done): my groups and discover, group page (events, members),
   event page (overview, chat history, checklist, polls, participants). 3. Write paths. 4. Chat realtime (Reverb) and offline queue. 5. Native polish, Play Store release. 6. Web parity and cutover.

## Dev notes

- Metro does not always notice file changes in this setup: if the browser shows stale UI, restart `npm run web`.
- Web uses the standard bottom tabs (`app-tabs.web.tsx`), native uses `NativeTabs` (`app-tabs.tsx`).
- The dev database needs the backend's migrations (`php artisan migrate`) before new API features work.
