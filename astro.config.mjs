import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import { YouTube } from 'astro-embed';

// https://astro.build/config
export default defineConfig({
  site: "https://michael-yang.com",
  integrations: [mdx(), sitemap(), solidJs(), tailwind({ applyBaseStyles: false })],
})