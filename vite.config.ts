import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { chatApi } from './server/vite-chat-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    // Serves POST /api/chat during `vite dev` / `vite preview`, so the Gemini
    // key stays server-side and never reaches the browser bundle. The same
    // handler is mounted in production by api/chat.ts on Vercel — see
    // "The AI Mentor endpoint — one handler, two mounts" in CLAUDE.md.
    chatApi(),
  ],
  // Which build an error report came from (src/lib/telemetry.ts). Vercel sets
  // the commit at build time; a local build says "dev".
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'
    ),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
