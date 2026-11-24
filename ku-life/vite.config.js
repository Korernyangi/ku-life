import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        campus: fileURLToPath(new URL('./index.html', import.meta.url)),
        atlas: fileURLToPath(new URL('./atlas.html', import.meta.url)),
      },
    },
  },
});
