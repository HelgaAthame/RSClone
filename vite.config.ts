import { defineConfig } from 'vite';


export default defineConfig({
  server: {
    port: 5000,
},
  build: {
    chunkSizeWarningLimit: 1500,
  }

})
