import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    // 修复：使用 () => import(...) 实现懒加载
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
    { path: '/todos', name: 'todos', component: () => import('@/views/TodosView.vue'), meta: { requiresAuth: true } }
  ]
})

// 路由守卫：改为直接返回，不再使用 next 回调
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return '/login'
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    return '/todos'
  }
  // 允许访问
  return true
})

export default router