import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'   // 新增

import App from './App.vue'
import router from './router'

// import './assets/main.css'      // 保留原有样式，也可以后面换成 scss

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)                  // 全局使用 naive-ui

app.mount('#app')