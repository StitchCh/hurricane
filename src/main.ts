import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import '@/assets/styles/main.scss'

import App from './App.vue'
import router from './router'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
