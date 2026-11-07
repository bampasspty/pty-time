import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1800,
  },
  server: {
    host: '0.0.0.0',
    // OneDrive crea archivos temporales bloqueados que tumban el watcher en Windows.
    // Sin watch, el servidor es estable; se reinicia para recargar cambios.
    watch: null,
  },
});
