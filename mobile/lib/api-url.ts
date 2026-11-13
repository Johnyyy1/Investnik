/** `next dev` and `next start` listen here unless the developer passes another port. */
const DEV_BACKEND_PORT = "3000";

type ApiOriginInput = {
  /** EXPO_PUBLIC_API_URL, inlined at build time. */
  configured: string | undefined;
  /** The host:port the device loaded the JS bundle from (Metro), only present in development. */
  metroHostUri: string | undefined;
  isDevelopment: boolean;
};

/**
 * Origin of the Investník Next.js backend, the single authority for accounts, progress and portfolios.
 * An explicit EXPO_PUBLIC_API_URL wins, and release builds accept only https. In development without it,
 * the app uses the Mac it already reaches Metro on: `localhost` on a physical phone is the phone itself.
 */
export function resolveApiOrigin({ configured, metroHostUri, isDevelopment }: ApiOriginInput): string {
  if (configured) {
    let url: URL;
    try {
      url = new URL(configured);
    } catch {
      throw new Error(`EXPO_PUBLIC_API_URL is not an absolute URL: "${configured}".`);
    }
    if (url.protocol !== "https:" && !(isDevelopment && url.protocol === "http:")) {
      throw new Error(`EXPO_PUBLIC_API_URL must use https${isDevelopment ? " or http" : " in release builds"}.`);
    }
    return url.origin;
  }
  if (isDevelopment && metroHostUri) {
    const url = new URL(`http://${metroHostUri}`);
    url.port = DEV_BACKEND_PORT;
    return url.origin;
  }
  throw new Error("EXPO_PUBLIC_API_URL is required in release builds.");
}
