/**
 * Extends app.json. One thing is decided at build time: a local test build (scripts/build-apk.sh) talks to the
 * backend on this machine over plain http, which Android blocks in release builds unless cleartext traffic is
 * allowed. A real release never sets APP_ALLOW_CLEARTEXT, so it keeps Android's default (https only).
 */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ...(process.env.APP_ALLOW_CLEARTEXT === '1' ? [['expo-build-properties', { android: { usesCleartextTraffic: true } }]] : []),
  ],
});
