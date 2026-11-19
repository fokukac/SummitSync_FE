# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Expo (React Native) client for SummitSync: Android first, web from the same code, iOS later. It is a thin client of the Laravel backend in the sibling repo `../be` (its `/api/v1`, Sanctum bearer tokens, OpenAPI docs at `/docs/api`). `be` and `fe` are **separate git repos**. `AGENTS.md` holds the generic Expo rules (Expo changes between SDKs: check the versioned docs before touching Expo/React Native APIs); `README.md` has the roadmap and the realtime notes.

## Commands

```bash
npm run check                          # lint + prettier check + tsc + jest: what CI runs (CI also does `npm run build:web`)
npx jest __tests__/foo.test.ts         # one test file; add `-t "name"` for one test
npm run typecheck | npm run lint | npm run format
npm run web                            # http://localhost:8081 (restart it if Metro shows stale UI)
npm run sync:backend                   # pull everything shared with ../be (see below); needs the Sail containers running
scripts/build-apk.sh [host]            # local Android test APK -> dist/summitsync-test.apk
scripts/emulator.sh start|install|launch|screenshot|ui|tap-text|logs|stop   # drive the app on an emulator; opens a window, never touches a USB phone
```

Add packages with `npx expo install <pkg>`. Demo login on the dev backend: `alice@example.test` / `password`.

## Shared with the backend: never edit by hand

`npm run sync:backend` re-exports the OpenAPI spec and regenerates `src/api/schema.d.ts`, and copies the website's `src/i18n/locales/*`, `src/constants/activity-icons.ts` and `src/constants/emojis.ts` from `../be`. Hand edits there are overwritten.

- **New UI strings** are added in `../be/resources/js/i18n/locales/{en,hu,ro}/*.ts` (all three languages, or `vue-tsc` there fails), then synced here.
- **API changes** start in the backend; after syncing, `tsc` errors show what the app must adapt.

## Architecture

- **Routing** (`src/app`, Expo Router): three states, three groups: `(auth)` signed out, `verify-email` signed in but unverified, `(app)` signed in and verified. `Stack.Protected` in `_layout.tsx` switches between them. The tab bar is `components/app-tabs.tsx`.
- **Providers** (`_layout.tsx`, outermost first): theme, i18n, auth, then the persisted React Query client. Queries are cached to storage for offline reading and paused mutations resume on start (`lib/query-client.ts`).
- **API** (`src/api/client.ts`): typed `openapi-fetch` client that adds the bearer token and `Accept-Language`, signs out on a 401, and aborts requests after 20 s (120 s for multipart uploads). A request that never gets an answer rejects, so callers must handle that (see `attempt()` in `auth/auth-context.tsx`). Reference data (activities, languages, feature flags) comes from `GET /v1/meta` via `features/forms/use-meta.ts`.
- **Auth** (`src/auth`): token in `expo-secure-store` (`localStorage` on web); password login with a two-factor step; native Google sign-in on Android only, and only when `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set (the backend verifies Google's access token at `POST /v1/auth/google`).
- **Realtime chat** (`lib/realtime.ts`): one `pusher-js` connection to Laravel Reverb; private channels are authorized by `POST /v1/broadcasting/auth` with the bearer token.
- **Code placement:** routes only in `src/app`; screens' building blocks in `src/features` and `src/components`; framework-free logic in `src/lib`.

## Gotchas

- **Keep testable logic out of components.** Jest (`jest-expo`) cannot load modules that import much of React Native (e.g. `themed-text`), so a test importing a component file fails to run. Put pure helpers in `src/lib` and test those (`__tests__/*.test.ts`, `@/` maps to `src/`).
- **Hermes (Android) has no `Intl.PluralRules`**: construct plural forms through `pluralForm()` in `src/i18n`, never `Intl.PluralRules` directly.
- **Emulator and builds reach the host differently:** an emulator sees the machine as `10.0.2.2`; a phone build bakes in this machine's LAN address (`build-apk.sh`), so rebuild when it changes. Plain http is allowed in test builds only (`APP_ALLOW_CLEARTEXT` in `app.config.js`).
- The activity limit (30) mirrors the server's validation; the filter and picker keep their own copies of it.

## Git

Work happens on `feature/<name>` branches merged into `development` with `--no-ff` ("Merge feature/<name> into development"); CI runs on pushes to `main` and `development` and on pull requests.
