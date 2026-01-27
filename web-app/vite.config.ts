import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {             // <-- alias must be inside "resolve"
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  }
})
