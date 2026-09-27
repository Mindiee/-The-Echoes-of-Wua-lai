import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { watch: { ignored: ['**/sources/**'] } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
})
