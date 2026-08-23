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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
