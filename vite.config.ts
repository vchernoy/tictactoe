import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Repo: vchernoy/tictactoe → served at https://vchernoy.github.io/tictactoe/
export default defineConfig({
  base: '/tictactoe/',
  plugins: [react()],
})
