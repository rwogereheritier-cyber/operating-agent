import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// singlefile is used so the prototype preview is one portable HTML; the same
// source deploys normally to Vercel.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
