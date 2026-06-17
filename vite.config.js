import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' for local file:// opening
// On Vercel the SPA rewrite rule handles all routes so '/' also works
// We keep './' so the single-file HTML build stays compatible with file://
export default defineConfig({
  plugins: [react()],
  base: './',
})
