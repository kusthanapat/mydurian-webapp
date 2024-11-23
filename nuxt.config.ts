// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  build: {
    transpile: ['vue-apexcharts']
  },
  plugins: [
    { src: '~/plugins/vue-apexcharts.js', mode: 'client' }
  ]
})