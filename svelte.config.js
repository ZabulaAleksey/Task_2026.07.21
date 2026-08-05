import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  kit: {
    adapter: adapter(),
    csp: {
      mode: "auto",
      directives: {
        "default-src": ["self"],
        "base-uri": ["self"],
        "connect-src": ["self", "wss:"],
        "font-src": ["self"],
        "form-action": ["self"],
        "frame-ancestors": ["none"],
        "img-src": ["self", "data:"],
        "object-src": ["none"],
        "script-src": ["self"],
        "style-src": ["self"],
        "worker-src": ["self"],
      },
    },
  },
  compilerOptions: {
    runes: true,
  },
};

export default config;
