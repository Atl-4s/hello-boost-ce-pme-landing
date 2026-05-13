import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

const adapter = process.env.NETLIFY === "true" ? netlify() : vercel();

export default defineConfig({
  output: "static",
  adapter,
  vite: {
    plugins: [tailwindcss()],
  },
});
