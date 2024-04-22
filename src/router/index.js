import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from "@/views/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ForgetView from "@/views/ForgetView.vue";
import S3AdminView from "@/views/S3AdminView.vue";
import UserAdminView from "@/views/UserAdminView.vue";
import axios from 'axios';
import { ENDPOINTS } from '@/api.config.js';
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

router.beforeEach(async (to, _, next) => {
  // 检查目标路由是否需要认证  

  const requiresAuth = to.meta.requiresAuth === 'true';
  if (requiresAuth) {
    try {
      const response = await axios.get(ENDPOINTS.getUserInfo, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const userInfo = response.data;
        if (userInfo && userInfo.permission) {
          console.log(userInfo)
          // 根据权限进行重定向
          if (userInfo.permission === 'userAdmin') {
            next('/userAdmin');
          } else if (userInfo.permission === 's3Admin') {
            next('/s3Admin');
          } else if (userInfo.permission === 'general') {
            next('/dashboard'); // 只有普通用户（permission为'general'）重定向到/dashboard
          } else {
            // 用户信息无效或缺失权限字段，重定向到登录或错误页面
            console.warn('Invalid or missing permission field in user data:', userInfo);
            next('/login');
          }
        }
      } else {
        // 登录失败或API返回错误状态码，重定向到登录页面  
        next('/login');
      }
    } catch (error) {
      // 处理请求错误，重定向到登录页面或错误页面  
      console.error('An error occurred during login:', error);
      next('/login');
    }
  } else {
    if (to.path === '/') {
      next('/login');
    }

    next();
  }
});
export default router
