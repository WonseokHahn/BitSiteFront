/* eslint-disable vue/multi-word-component-names */

<template>
  <div class="login">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">로그인</h1>
          <p class="login-subtitle">
            소셜 계정으로 간편하게 로그인하세요
          </p>
        </div>
        
        <div class="login-body">
          <!-- 에러 메시지 -->
          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
          
          <!-- 소셜 로그인 버튼들 -->
          <div class="social-login">
            <button 
              @click="loginWithGoogle"
              class="social-button google"
            >
              <svg class="social-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>
            
            <button 
              @click="loginWithKakao"
              class="social-button kakao"
            >
              <svg class="social-icon" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.518-3.467C3.462 16.4 1.5 14.376 1.5 11.185 1.5 6.665 6.201 3 12 3z"/>
              </svg>
              카카오로 로그인
            </button>
          </div>
          
          <!-- 서비스 설명 -->
          <div class="service-info">
            <h3 class="info-title">로그인 후 이용 가능한 서비스</h3>
            <ul class="info-list">
              <li>AI 기반 자동매매 전략 설정</li>
              <li>실시간 주식 자동매매 실행</li>
              <li>개인화된 투자 포트폴리오 관리</li>
              <li>매매 내역 및 수익률 분석</li>
            </ul>
          </div>
        </div>
        
        <div class="login-footer">
          <p class="footer-text">
            로그인하면 
            <a href="#" class="footer-link">서비스 이용약관</a>과 
            <a href="#" class="footer-link">개인정보처리방침</a>에 
            동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { redirectToLogin } from '@/utils/auth'

export default {
  name: 'LoginPage',
  data() {
    return {
      errorMessage: null
    }
  },
  created() {
    // URL에서 에러 파라미터 확인
    const error = this.$route.query.error
    if (error === 'auth_failed') {
      this.errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.'
    }
  },
  methods: {
    ...mapActions('auth', ['loginWithToken']),
    
    loginWithGoogle() {
      this.clearError()
      redirectToLogin('google')
    },
    
    loginWithKakao() {
      this.clearError()
      redirectToLogin('kakao')
    },
    
    clearError() {
      this.errorMessage = null
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.login-container {
  width: 100%;
  max-width: 900px;
  /* display: grid;
  grid-template-columns: 1fr 1fr; */
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  align-items: start;
}

.login-card {
  background-color: var(--white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.login-header {
  padding: var(--spacing-xxl) var(--spacing-xl) var(--spacing-xl);
  text-align: center;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
}

.login-title {
  font-size: var(--font-xxl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-md);
  margin: 0;
}

.login-body {
  padding: var(--spacing-xl);
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-lg);
  background-color: var(--white);
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  color: var(--text-primary);
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.social-button.google {
  border-color: #4285f4;
}

.social-button.google:hover {
  background-color: #4285f4;
  color: var(--white);
}

.social-button.kakao {
  border-color: #fee500;
  background-color: #fee500;
  color: #000000;
}

.social-button.kakao:hover {
  background-color: #fdd835;
  border-color: #fdd835;
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.service-info {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

.info-title {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
  position: relative;
  padding-left: var(--spacing-lg);
}

.info-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success-color);
  font-weight: var(--font-bold);
}

.login-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
}

.footer-text {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.footer-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: var(--font-medium);
}

.footer-link:hover {
  text-decoration: underline;
}

.demo-info {
  align-self: center;
}

.demo-card {
  background-color: var(--white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xxl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.demo-title {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.demo-description {
  color: var(--text-secondary);
  font-size: var(--font-md);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .login {
    padding: var(--spacing-sm);
  }
  
  .login-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    max-width: 500px;
  }
  
  .login-header,
  .login-body,
  .login-footer {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
  
  .login-title {
    font-size: var(--font-xl);
  }
  
  .social-button {
    padding: var(--spacing-lg);
  }
  
  .demo-card {
    padding: var(--spacing-xl);
  }
  
  .demo-title {
    font-size: var(--font-lg);
  }
}

@media (max-width: 480px) {
  .login-header,
  .login-body,
  .login-footer,
  .demo-card {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
}
</style>