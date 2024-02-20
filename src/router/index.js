import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ForgetView from "@/views/ForgetView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {  
      path: '/',  
      redirect: '/login' // 默认重定向到登录页面  
    }, 
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/forget',
      name: 'forget',
      component: ForgetView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true } // 标记需要认证的路由  
    },
  ]
})

router.beforeEach((to, _, next) => {  
  // 检查cookie是否存在  
  const hasAuthCookie = document.cookie.includes('session_id'); // 替换'session_id'为你的cookie名称  
  
  // 如果访问的是根路径  
  if (to.path === '/') {  
    // 根据是否有cookie决定重定向  
    if (hasAuthCookie) {  
      // 如果有cookie，重定向到dashboard  
      next('/dashboard');  
    } else {  
      // 如果没有cookie，重定向到login  
      next('/login');  
    }  
    return; // 确保在此处停止执行后续代码  
  }  
  
  // 检查目标路由是否需要认证  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);  
  
  // 如果目标路由需要认证  
  if (requiresAuth) {  
    // 如果没有认证cookie，则重定向到登录页  
    if (!hasAuthCookie) {  
      next('/login');  
    } else {  
      // 如果有认证cookie，正常导航  
      next();  
    }  
  } else {  
    // 如果目标路由不需要认证，正常导航  
    next();  
  }  
});
export default router
