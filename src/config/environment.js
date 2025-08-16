// 환경별 설정 관리
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    ENVIRONMENT: 'development'
  },
  production: {
    API_BASE_URL: process.env.VUE_APP_API_URL || 'https://bitsiteback.onrender.com/api',
    ENVIRONMENT: 'production'
  }
}

const currentConfig = config[process.env.NODE_ENV] || config.development

export default {
  ...currentConfig,
  // 공통 설정
  APP_NAME: 'AI 사이트',
  VERSION: '1.0.0',
  
  // OAuth 리디렉션 URL
  getOAuthRedirectUrl: (provider) => {
    return `${currentConfig.API_BASE_URL.replace('/api', '')}/api/auth/${provider}`
  },
  
  // 디버그 모드
  DEBUG: process.env.NODE_ENV === 'development',
  
  // 로깅 레벨
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
}