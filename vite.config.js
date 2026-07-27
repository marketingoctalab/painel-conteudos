import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // "/" continua sendo a apresentação (wrapper em index.html)
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // "/estudio" carrega o Estúdio React (login/admin + calendário/quadro)
        estudio: fileURLToPath(new URL('./estudio.html', import.meta.url)),
      },
    },
  },
})
