import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from "@/views/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ForgetView from "@/views/ForgetView.vue";
import S3AdminView from "@/views/S3AdminView.vue";
import UserAdminView from "@/views/UserAdminView.vue";
const env_requires_auth = import.meta.env.VITE_REQUIRES_AUTH;

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
      meta: { requiresAuth: env_requires_auth } // 标记需要认证的路由  
    },
    {
      path: '/userAdmin',
      name: 'userAdmin',
      component: UserAdminView,
      meta: { requiresAuth: env_requires_auth } // 标记需要认证的路由  
    },
    {
      path: '/s3Admin',
      name: 's3Admin',
      component: S3AdminView,
      meta: { requiresAuth: env_requires_auth } // 标记需要认证的路由  
    },
  ]
})

export default router
