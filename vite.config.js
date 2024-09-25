// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
import dotenv from 'dotenv';

dotenv.config({path:'./config.env'});

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   // optimizeDeps: {
//   //   // include: ['quill'],
//   // },
//   define: {
//     'process.env': process.env
//   },
//     server: {
//     historyApiFallback: true
//   },
//   optimizeDeps: {
//     include: ['xlsx'],
//   },

// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This affects only local dev; deployment is handled by the app.yaml config
    historyApiFallback: true
  },
  define: {
        'process.env': process.env
      },
  build: {
    outDir: 'dist',  // Ensure output is directed to the 'dist' folder
    rollupOptions: {
      input: './index.html', // Your app's entry point
    },
  },
  optimizeDeps: {
    include: ['xlsx'],  // This is fine if you're optimizing dependencies
  },
})
