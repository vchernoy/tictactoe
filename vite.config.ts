import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Served at https://tictactoe.vchernoy.xyz (GitHub Pages custom subdomain)
export default defineConfig({
  base: '/',
  plugins: [react()],
})
