import Constants from "expo-constants";
import { resolveApiOrigin } from "./api-url";

// Validated once at startup, so a misconfigured build fails on launch instead of on its first request.
// process.env.EXPO_PUBLIC_API_URL must stay a literal member access: Expo inlines it at build time.
export const apiOrigin = resolveApiOrigin({
  configured: process.env.EXPO_PUBLIC_API_URL,
  metroHostUri: Constants.expoConfig?.hostUri,
  isDevelopment: __DEV__,
});
