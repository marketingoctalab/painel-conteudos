import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // "/" é o Estúdio React (login/admin + calendário/planejamento/tarefas)
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // "/estudio" mantém o mesmo app, para não quebrar links já compartilhados
        estudio: fileURLToPath(new URL('./estudio.html', import.meta.url)),
        // A proposta (apresentação) segue publicada, mas fora da raiz:
        // acessível apenas em /apresentacao.html (arquivo estático em public/).
      },
    },
  },
})
