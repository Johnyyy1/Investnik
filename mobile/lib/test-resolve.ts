// Loaded with `node --import` before the unit tests. Node ignores tsconfig paths, so this applies the same
// mappings that tsconfig.json and metro.config.js apply: the shared contracts folder, and zod from mobile/node_modules.
import { registerHooks } from "node:module";

const contracts = new URL("../../packages/contracts/src/index.ts", import.meta.url).href;
const contractsDir = new URL("../../packages/contracts/src/", import.meta.url).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@investnik/contracts") return { url: contracts, shortCircuit: true };
    if (specifier === "zod") return nextResolve(specifier, { ...context, parentURL: import.meta.url });
    // Contracts import their own files without an extension, as Metro and the web bundler allow; Node needs it.
    if (specifier.startsWith("./") && context.parentURL?.startsWith(contractsDir)) return nextResolve(`${specifier}.ts`, context);
    return nextResolve(specifier, context);
  },
});
