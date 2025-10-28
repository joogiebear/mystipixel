// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  nitro: {
    rollupConfig: {
      external: ['@prisma/client', '.prisma/client']
    }
  }
})