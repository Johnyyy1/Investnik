# @investnik/contracts

Zod schemas and types shared by the web API (`src/app/api/v1/`) and the Expo app (`mobile/`). Background: [API plan](../../docs/mobile/api-plan.md#contracts-package) and [monorepo assessment](../../docs/mobile/architecture-audit.md#monorepo-assessment).

This is a source-only folder, not an installed package. It has no dependencies, no scripts, no build step and no `node_modules`. Each project compiles it as part of its own source.

## Rules

- `zod` is the only import, apart from relative imports inside this folder. ESLint enforces this in the web project.
- No React, no React Native, no Node APIs (`node:*`, `process`, `Buffer`), no `server-only`.
- No `@/` alias and no import from `src/` or `mobile/`. The web must stay free to import from here, never the reverse.
- Nothing here reads the environment, the clock or the network. Schemas, types and pure functions only.

## How each project resolves it

| | Web (root) | Mobile (`mobile/`) |
| --- | --- | --- |
| `@investnik/contracts` | `tsconfig.json` path to `packages/contracts/src` | `mobile/tsconfig.json` path; Metro reads the same path |
| `zod` | Root `node_modules/zod` | `mobile/node_modules/zod`, forced by a `zod` path in `mobile/tsconfig.json` and by `mobile/metro.config.js` (`nodeModulesPaths`; the root `node_modules` is outside `watchFolders`, so Metro never sees it). Node tests use `mobile/lib/test-resolve.ts` |
| Checks | Root lint, knip, typecheck | Mobile typecheck and `check:export` |

Both lockfiles must pin the same `zod` version. `scripts/check-zod-versions.mjs` fails CI otherwise, so a `zod` upgrade updates `package-lock.json` and `mobile/package-lock.json` in the same PR.
