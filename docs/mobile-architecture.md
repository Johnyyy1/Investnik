# Mobile app architecture

The Milestone 0 discovery of 2026-11-14 continues this document in [mobile/architecture-audit.md](mobile/architecture-audit.md), [mobile/api-plan.md](mobile/api-plan.md) and [mobile/implementation-roadmap.md](mobile/implementation-roadmap.md). The route prefix is decided: `/api/v1` (decision D1 in the audit). Milestone numbering follows the roadmap; the "M1" below predates it.

Status 2026-11-13: infrastructure only. `mobile/` is a minimal Expo app that starts, validates its backend URL and checks that it can reach the backend. It has no product screens, no sign-in and no shared contracts yet. Nothing in the web app, database, authentication or deployment behaves differently.

## Repository structure

```text
/                      Next.js web app and the only backend (unchanged)
├── src/               web app, Server Actions, route handlers, domain modules
└── mobile/            Expo app, its own npm project and lockfile
    ├── app/           Expo Router routes (_layout.tsx, index.tsx)
    ├── lib/           env.ts (validated backend origin), api-url.ts (+ test), theme.ts (native tokens)
    ├── assets/        icon.png, splash-icon.png (generated, see below)
    ├── app.json       identity, platforms, plugins
    ├── eas.json       EAS build profiles
    └── package.json   scripts and SDK-aligned dependencies
```

Add `components/` (app-wide native components) and `features/<domain>/` (screens' data hooks and views per domain: learn, progress, lab, account) inside `mobile/` when the first screen needs them. Routes in `app/` stay thin and import from `features/`.

**No npm workspaces, no `packages/` yet.** Reasons, checked on this branch:

- Expo SDK 58 requires `react@19.3.0`; the web app runs `react@19.3.1`. One hoisted tree would either break Expo's version alignment (`expo-doctor`) or give Metro two Reacts.
- Vercel runs `npm ci` at the root for every web deployment. As a workspace, the app's ~450 native packages would be installed on every web deploy.
- Separately, Expo's Metro config watches only `mobile/`, so the bundler cannot import web code by accident. The audit below confirms it.

The root tooling skips `mobile/`: `tsconfig.json` excludes it, `eslint.config.mjs` and `knip.jsonc` ignore it, and `src/app/globals.css` sets `@source not "../../mobile"`. Without that line, Tailwind's automatic source detection would scan the app's files (verified with Tailwind's scanner).

A `packages/contracts` package is created with the first versioned mobile endpoint, not before (see [Backend integration](#backend-integration)).

## Stack and versions

| Concern | Choice | Notes |
| --- | --- | --- |
| SDK | Expo SDK 58 (`expo ~58.0.25`), React Native 0.88.1, React 19.3.0 | Latest stable on 2026-11-13. Upgrade with `npx expo install expo@^NN && npx expo install --fix`, never piecemeal |
| Navigation | Expo Router 58 (native stack via react-native-screens) | Typed routes enabled |
| Architecture / engine | New Architecture, Hermes | RN 0.88 defaults; prebuild output shows `newArchEnabled=true`, `hermesEnabled=true` and `expo.jsEngine: hermes` |
| Rendering | React Compiler (`experiments.reactCompiler`) | Automatic memoisation instead of hand-written `useMemo`/`memo` |
| Language | TypeScript 6, `strict` + `noUncheckedIndexedAccess` | |
| Lint | ESLint 9 flat config with `eslint-config-expo` | `npm run lint` lints the whole app |
| Native builds | `expo-dev-client`, EAS Build profiles | CNG: `ios/` and `android/` are generated, gitignored, never committed |
| Identity | Name „Investník“, slug/scheme `investnik`, iOS bundle ID and Android package `cz.investnik.app` | IDs are permanent once registered in App Store Connect and Play Console. Confirm before the first store build |
| Appearance | `userInterfaceStyle: "light"` (with `expo-system-ui` so Android respects it) | The web has no dark palette. Switch to `automatic` only once one is approved |

Deliberately not added yet: TanStack Query, a global state library, a UI kit, fonts, `@better-auth/expo`, `expo-secure-store`, analytics and notifications. Each comes with the milestone that needs it.

## Local development

Prerequisites on the Mac: Node 24 (`.nvmrc`), Xcode with an iOS simulator for `npm run ios`, Android Studio with an emulator for `npm run android`. A physical device needs a development build installed (`npm run ios -- --device`, `npm run android`, or an EAS `development` build).

```bash
# Terminal 1: the backend, from the repository root (unchanged web workflow)
npm run dev                      # Next.js on :3000, listening on all interfaces

# Terminal 2: the app
cd mobile
npm ci
npm run ios                      # first time / after native changes: builds and installs the dev client
npm start                        # afterwards: Metro only, the installed dev client connects to it
```

The web app never needs a rebuild for mobile work, and the reverse holds too.

**Reaching the backend.** On a phone, `localhost` is the phone itself, so the app never assumes it. With `EXPO_PUBLIC_API_URL` unset in development, `lib/env.ts` takes the host the device already loaded the bundle from (Metro's `hostUri`, e.g. `192.168.1.20:8081`) and uses port 3000 on it. This works unchanged on the iOS simulator, the Android emulator and physical devices on the same Wi-Fi. Set `EXPO_PUBLIC_API_URL` in `mobile/.env` (see `mobile/.env.example`) when the backend runs elsewhere, on another port, or when Metro runs with `--tunnel`. The start screen shows the origin it uses and whether `GET /api/auth/ok` answered.

- iOS asks for **local network** permission the first time a dev build talks to the Mac. Allow it.
- The Mac firewall must allow incoming connections to Node.
- Debug builds allow plain HTTP only for development: Android sets `usesCleartextTraffic` in debug variants only, and iOS keeps `NSAllowsArbitraryLoads=false` with `NSAllowsLocalNetworking`. Release builds reject any non-https `EXPO_PUBLIC_API_URL` at startup.

**Checks** (from `mobile/`): `npm run lint`, `npm run typecheck`, `npm test` (Node's test runner, pure modules only), `npm run doctor` (expo-doctor), `npm run check:export` (Metro + Hermes bundles for both platforms, no native toolchain needed).

**Brand assets.** `mobile/assets/icon.png` (1024², full-bleed tile, also the Android adaptive foreground on Action Teal) and `splash-icon.png` come from `public/brand/*.svg` through `npm run brand:assets` at the root. Never edit the PNGs by hand.

## Environment

| Variable | Where | Meaning |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `mobile/.env` (ignored), EAS profile `env` | Backend origin. Optional in development (Metro host + :3000). Required and https-only in release builds. `eas.json` sets `https://investnik.cz` for `preview` and `production` |

Every `EXPO_PUBLIC_*` value is inlined into the bundle and readable by anyone with the app. The app holds no secrets: no database URL, no auth secret, no provider keys. The backend owns all of them. Reference the variable only as the literal `process.env.EXPO_PUBLIC_API_URL`, because Expo inlines only static member access.

## Backend integration

The Next.js app stays the only authority for accounts, lesson progress, rewards, Practice Capital, trades, prices and FX. The app never computes or stores financial state that the server has not returned.

Current shape: the web UI calls 11 Server Action modules (`src/features/*/actions.ts`). Each is a thin wrapper: read the session (`getCurrentUser`), validate with Zod, call the domain repository, return a presentation object. Route handlers already follow the same pattern (`src/app/api/portfolio/export/route.ts`). Server Actions are a framework-internal RPC tied to the web build (action IDs change per build), so a native client must not call them.

Plan:

1. **Versioned route handlers per use case**, under `src/app/api/v1/…`, added one screen at a time. Each handler does what the matching action does (session, ownership, Zod input, repository call) by calling the **same repository functions**. It never copies domain logic. Where an action and a handler would duplicate more than the session and validation lines, extract the shared body into the feature module, as an ordinary refactor with tests. Do not convert actions wholesale.
2. **Contracts.** With the first handler, create `packages/contracts` (plain TypeScript + Zod, no React, no Node or server imports) holding that endpoint's request and response schemas. The handler parses its output with them in tests, and the app validates responses with them. Wire it with a TS path plus Metro `watchFolders` (or a `file:` dependency). `zod` must resolve from `mobile/node_modules` only; the plan is in the [audit](mobile/architecture-audit.md#monorepo-assessment). Money crosses the wire as integer minor units in strings, as `serializePracticeCapitalMinor` already does.
3. **Versioning.** A breaking change adds `/v2` beside `/v1`. Installed apps cannot be force-updated instantly, so `/v1` lives until usage data says otherwise. A forced update is still possible: from the first tester build the app checks `GET /api/v1/app-config` (`minSupportedVersion`, `latestVersion`, `maintenance`) at start-up ([API plan](mobile/api-plan.md#app-configuration)).
4. **Unchanged guarantees.** Rate limits (the shared Postgres limiter), session checks, structured errors without internals (`logUnexpectedError`) and `Cache-Control: no-store` on personal data. `/api/*` keeps its static CSP from `next.config.ts`.

## Authentication plan

Better Auth's official Expo integration is `@better-auth/expo`: a server plugin `expo()` and a client `expoClient({ scheme, storagePrefix, storage: SecureStore })`. The client keeps the session cookie in `expo-secure-store` (Keychain / Android Keystore-backed), sends it as a `cookie` header with an `expo-origin` header, and handles OAuth through `expo-web-browser` with a deep link back to `investnik://`. Accounts, sessions, rate limits, hooks, anonymous guests and account linking stay exactly as they are: same handler, same tables.

Not done on this branch, because the server change cannot be verified without a native runtime:

1. Align versions: `@better-auth/expo` must match the server's `better-auth` (currently 1.7.12 in the lockfile, while `@better-auth/expo@1.7.23` peers on `^1.7.23`). Either upgrade the web's `better-auth` in its own PR or pin the Expo package to the server version.
2. Server: add `expo()` to `plugins` in `src/lib/auth.ts`. Add the app's origins to trusted origins: `investnik://` everywhere, `exp://` only in development. `BETTER_AUTH_TRUSTED_ORIGINS` already exists for this, so local testing needs no code change. Run `test:auth-browser`, `test:account-recovery` and `test:guest-claim` to prove the web flow is unchanged.
3. App: `npx expo install expo-secure-store expo-web-browser expo-network`, then `@better-auth/expo` and `better-auth` at the server's version. Create the auth client against `apiOrigin`.
4. Social sign-in: Google and Facebook callbacks keep hitting `https://investnik.cz/api/auth/callback/*`. The plugin redirects to `investnik://…` afterwards, so provider consoles need no mobile client IDs for the web-redirect flow. Native ID-token sign-in (Sign in with Apple, Google One Tap) is a later decision. App Store rules require Sign in with Apple once any third-party social login ships on iOS.
5. Sign-out calls the server's sign-out and clears SecureStore. Never keep tokens in AsyncStorage or plain files.

## CI

- `.github/workflows/mobile.yml` runs on PRs and `main` pushes that touch `mobile/**` or `packages/**`: the `zod` lockfile check, `npm ci`, lint, typecheck, unit tests, `expo-doctor` and a Metro export for both platforms. No signing, no EAS, no store upload.
- `ci.yml` skips PRs whose every changed file is under `mobile/` (`paths-ignore`). A PR touching anything else, and every push to `main`, still runs the full web pipeline. No status check is required on `main` today. If one becomes required, replace `paths-ignore` with an always-running job that skips internally.
- `browser.yml`, `vercel.json` and the Vercel build are unchanged. Vercel still creates a preview for a mobile-only PR. The build ignores `mobile/` (not installed, type-checked or scanned).
- Dependabot watches `mobile/` weekly, grouping minor and patch bumps. It ignores every package the Expo SDK pins (see the comment in `.github/dependabot.yml`), which also suppresses security updates for them.
- Expo SDK upgrades are manual, through `npx expo install --fix` and `expo-doctor`.

## Performance strategy

Targets, **not measurements**. Nothing has been measured on a device yet. Measure on release builds on a mid-range Android (the weaker platform) and a recent iPhone:

| Metric | Target | How |
| --- | --- | --- |
| Cold start to first meaningful screen | < 1.5 s mid-range Android, < 1 s iPhone | `adb shell am start -W` (TotalTime), Xcode Instruments App Launch. Track over releases |
| JS bundle (Hermes bytecode) | Watch growth per PR. Today ~2.4 MB per platform for the placeholder | `npm run check:export` output |
| Navigation (tap → next screen interactive) | < 100 ms for cached screens | React Native DevTools profiler, Perfetto / Instruments |
| Frame rate | 60 fps sustained (120 fps on ProMotion), no dropped frames during transitions | Perf Monitor overlay, Android GPU rendering profile |
| API latency (p75 from device) | < 300 ms for reads | Server timing already exists (`src/lib/perf.ts`). Add client timing around fetch. Note the production region gap in [performance-baseline.md](performance-baseline.md) |
| Memory | No growth across repeated navigation | Xcode Memory Graph, Android Studio profiler |

Rules that make the targets likely:

- Keep the startup path small: no work at module load besides env validation, no fonts blocking first paint (system font until brand fonts are measured), splash on the Paper colour so the handoff is seamless.
- Native stack navigation (react-native-screens) only, no JS-driven transitions. Lists use `FlatList` or FlashList once lists exist.
- Let React Compiler handle memoisation. Keep state local to screens. No global store until a requirement survives code review.
- **Server state: TanStack Query** with the first data screen. It provides cache-first screen revisits, request deduplication, focus/online refetch through `focusManager`/`onlineManager`, and persistence (`@tanstack/query-async-storage-persister`) for offline reading of already loaded lessons. Persist only non-sensitive educational content, never session data or portfolio balances shown as current.
- `expo-image` for remote images (memory and disk cache). Static assets are bundled.
- One request per screen where possible: shape endpoints for the screen rather than chaining calls.

## Design system preparation

`mobile/lib/theme.ts` mirrors a few anchors from [DESIGN.md](../DESIGN.md) (Paper, Ink, Action Teal, spacing, radii) as plain numbers and hex values. Mobile never imports web CSS, Tailwind classes or React DOM components. Build native components on React Native primitives and platform conventions: native stack headers, iOS swipe-back, Android back, Dynamic Type via `allowFontScaling`, VoiceOver/TalkBack roles, and `expo-haptics` for confirmations only. Before the first real screen, generate the native tokens from the DESIGN.md frontmatter instead of copying by hand. Fonts (Manrope, Inter via `expo-font`), dark appearance and haptics policy are design decisions for that milestone.

## Known risks and constraints

- **No native runtime was verified here.** This Mac has no Xcode and no Android SDK. Validation stops at config, types, lint, unit tests, expo-doctor, a throwaway `expo prebuild` (inspected, then deleted) and Metro/Hermes export.
- The bundle IDs, the scheme and EAS project linking (`eas init` writes `extra.eas.projectId` and `owner`) need an Expo account and founder confirmation.
- SDK upgrades arrive roughly three times a year. Each one is a deliberate PR (`expo install --fix`, `expo-doctor`, a device smoke test).
- `npm audit` reports 3 moderate advisories in Expo's transitive tooling (`minimatch` in the CLI chain). They are not in the app bundle, and `npm audit fix --force` would break SDK alignment.
- Product safeguards apply unchanged to mobile: educational only, no price notifications, no trade confetti or return leaderboards, server-owned prices, FX and balances, and Practice Capital as external contributions.

## Next milestone

**M1: signed-in Learn read path.**

1. Better Auth Expo integration (the [Authentication plan](#authentication-plan) above), behind its own PR with the auth browser and persistence suites.
2. `packages/contracts` plus the first endpoint, `GET /api/v1/learn` (the learner's map: modules, lesson status and next lesson), calling the existing progress and catalog repositories.
3. TanStack Query and a persisted cache for that response.
4. First native screen and native token generation, after a mobile design pass.
5. First device measurements against the targets above, recorded in this document.
