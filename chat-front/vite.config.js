import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  theme: {
    extend: {
      backgroundImage: {
        'diagonal-stripes': 'repeating-linear-gradient(45deg, var(--tw-gradient-from) 0%, var(--tw-gradient-from) 10px, var(--tw-gradient-to) 10px, var(--tw-gradient-to) 20px)',
      },
    },
  },
})
