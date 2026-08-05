import { env } from "$env/dynamic/public";
import type { LayoutServerLoad } from "./$types";

function resolveCanonicalOrigin(requestOrigin: string) {
  const configuredOrigin = env.PUBLIC_SITE_URL?.trim();
  if (!configuredOrigin) return requestOrigin;

  const url = new URL(configuredOrigin);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
    throw new Error("PUBLIC_SITE_URL must use HTTPS outside local development");
  }
  return url.origin;
}

export const load: LayoutServerLoad = ({ url }) => ({
  origin: resolveCanonicalOrigin(url.origin),
});
