import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Separate local Vite project; not part of Investník.
    "fine-details/**",
    // Expo app with its own ESLint config and dependencies; see docs/mobile-architecture.md.
    "mobile/**",
    // Local agent worktrees: full copies of the repository with their own build output.
    ".claude/**",
  ]),
  {
    // Shared with the Expo app: zod and relative imports only (packages/contracts/README.md).
    files: ["packages/contracts/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ regex: "^(?!zod$|\\./)", message: "packages/contracts may import only zod and its own files." }] },
      ],
    },
  },
]);

export default eslintConfig;
