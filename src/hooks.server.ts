import { dev } from "$app/environment";
import type { Handle, HandleServerError } from "@sveltejs/kit";

const SECURITY_HEADERS = {
  "permissions-policy":
    "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
} as const;

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  const hardenedResponse = new Response(response.body, response);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    hardenedResponse.headers.set(name, value);
  }
  if (event.url.protocol === "https:") {
    hardenedResponse.headers.set(
      "strict-transport-security",
      "max-age=31536000",
    );
  }

  return hardenedResponse;
};

export const handleError: HandleServerError = ({
  error,
  event,
  status,
  message,
}) => {
  const errorId = crypto.randomUUID();
  console.error("Unhandled application error", {
    errorId,
    method: event.request.method,
    path: event.url.pathname,
    status,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  if (dev) console.error(error);

  return {
    message:
      status === 404
        ? message
        : "The application could not complete the request.",
    errorId,
  };
};
