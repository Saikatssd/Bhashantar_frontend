import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import dotenv from 'dotenv';
import path from 'path';

// dotenv.config({ path: './config.env' });

export default defineConfig({
  root: '.', 
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    include: ['xlsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), 
    },
  },
});
