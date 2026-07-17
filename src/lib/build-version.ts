// Evaluated once per build (module singleton), so every page references the
// same versioned static-asset URL. Appending `?v=${BUILD_VERSION}` to long-
// lived scripts like i18n.js means each deploy produces a new URL and browsers
// stop running stale cached copies across deploys.
export const BUILD_VERSION = String(Date.now())
