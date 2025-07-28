import './assets/main.css'

// import { createApp, vaporInteropPlugin } from 'vue'
import { createVaporApp } from 'vue'
// import { createPinia } from 'pinia'

// import CodeEditor from 'bin-code-editor';
// import 'bin-code-editor/lib/styles/index.css';

import App from './App.vue'
import router from './router'
// const app = createApp(App)
const app = createVaporApp(App)

// app.use(createPinia())
// app.use(router)
// app.use(vaporInteropPlugin)
// app.use(CodeEditor)

app.mount('#app')
