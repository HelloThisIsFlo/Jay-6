/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module 'virtual:build-id' {
  // Dev-only build stamp from the jay6-build-id Vite plugin (see vite.config.ts).
  export const BUILD_ID: string;
}
