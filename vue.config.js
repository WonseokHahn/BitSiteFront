const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // GitHub Pages용 설정
  publicPath: process.env.NODE_ENV === 'production' 
    ? '/BitSiteFront/' // GitHub 저장소 이름으로 변경
    : '/',
  
  // 개발 서버 설정
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://bitsiteback.onrender.com'
          : 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // 빌드 최적화
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  },
  
  // PWA 설정 (선택사항)
  pwa: {
    name: '주식 자동매매 사이트',
    themeColor: '#1976d2',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxOptions: {
      skipWaiting: true 
    }
  }
})