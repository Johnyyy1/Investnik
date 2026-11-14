// https://docs.expo.dev/guides/customizing-metro/
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Shared schemas live outside the app; @investnik/contracts maps here through the tsconfig path.
config.watchFolders = [path.resolve(__dirname, "../packages/contracts")];
// Resolve every package, including zod imported from packages/contracts, from this app's node_modules only.
// Without this, a local checkout would silently bundle the web's root node_modules/zod, which CI and EAS do not have.
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

module.exports = config;
