import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 동적 import 대신 정적 import 사용 (GitHub Pages 호환)
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AuthCallback from '../views/AuthCallback.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { 
      title: '홈 - 주식 자동매매 사이트',
      requiresAuth: false 
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      title: '로그인 - 주식 자동매매 사이트',
      requiresAuth: false 
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { 
      title: '로그인 처리 중...',
      requiresAuth: false 
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: { 
      title: '페이지를 찾을 수 없습니다',
      requiresAuth: false 
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 라우터 가드
router.beforeEach((to, from, next) => {
  console.log('🔄 라우터 이동:', from.path, '→', to.path)
  
  // 페이지 타이틀 설정
  document.title = to.meta.title || '주식 자동매매 사이트'
  
  // 인증이 필요한 페이지 체크
  if (to.meta.requiresAuth) {
    const isAuthenticated = store.getters['auth/isAuthenticated']
    
    if (!isAuthenticated) {
      console.log('🔒 인증 필요 - 로그인 페이지로 이동')
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 이미 로그인한 사용자가 로그인 페이지에 접근하는 경우
  if (to.name === 'Login' && store.getters['auth/isAuthenticated']) {
    console.log('✅ 이미 로그인됨 - 홈으로 이동')
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router