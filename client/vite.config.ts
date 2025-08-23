import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { config } from 'dotenv'

config()

export default defineConfig({
  define: {
    'process.env': process.env
  },
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  server: {
    port: 5000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:5000",
  },
})

