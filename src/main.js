import './assets/main.css'

import { createApp, vaporInteropPlugin } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(vaporInteropPlugin)
app.use(createPinia())
app.use(router)

app.mount('#app')
