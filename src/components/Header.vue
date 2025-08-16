<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- 로고 -->
        <div class="header-logo">
          <router-link to="/" class="logo-link">
            <h1 class="logo-text">자유놀이터</h1>
          </router-link>
        </div>

        <!-- 사용자 메뉴 -->
        <div class="header-user">
          <div v-if="isAuthenticated" class="user-menu">
            <div class="dropdown">
              <button 
                class="dropdown-toggle user-toggle"
                @click="toggleUserMenu"
              >
                <img 
                  v-if="userAvatar" 
                  :src="userAvatar" 
                  :alt="userName"
                  class="user-avatar"
                >
                <div v-else class="user-avatar-placeholder">
                  {{ userName.charAt(0).toUpperCase() }}
                </div>
                <span class="user-name">{{ userName }}</span>
                <svg 
                  class="dropdown-arrow" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12"
                >
                  <path d="M6 8L2 4h8L6 8z" fill="currentColor"/>
                </svg>
              </button>
              
              <div v-if="showUserMenu" class="dropdown-menu">
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item">
                  로그아웃
                </button>
              </div>
            </div>
          </div>
          
          <!-- <div v-else class="auth-buttons">
            <router-link to="/login" class="btn btn-outline btn-sm">
              로그인
            </router-link>
          </div> -->
          <div v-else class="auth-buttons">
            <router-link to="/login" class="custom-login-button">
              로그인
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'HeaderView',
  data() {
    return {
      showUserMenu: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'userName', 'userAvatar'])
  },
  methods: {
    ...mapActions('auth', ['logout']),
    
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    
    async handleLogout() {
      this.showUserMenu = false
      await this.logout()
      this.$router.push('/')
    },
    
    // 외부 클릭시 메뉴 닫기
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showUserMenu = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
.custom-login-button {
  display: inline-block;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  background-color: #ffffff;
  border: 1px solid transparent; /* 기본은 투명 */
  border-radius: 6px; /* 덜 둥글게 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: all 0.2s ease-in-out;
}

.custom-login-button:active {
  border-color: #888; /* 누를 때만 테두리 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.custom-login-button:hover {
  background-color: #f9f9f9;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--white);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-fixed);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.header-logo .logo-link {
  text-decoration: none;
}

.logo-text {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
  margin: 0;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

.header-user {
  display: flex;
  align-items: center;
}

.user-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.user-toggle:hover {
  background-color: var(--light-gray);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-medium);
  font-size: var(--font-sm);
}

.user-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.dropdown-arrow {
  transition: transform var(--transition-fast);
}

.dropdown-toggle[aria-expanded="true"] .dropdown-arrow {
  transform: rotate(180deg);
}

.auth-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

 /* 모바일 반응형 */
@media (max-width: 768px) {
  .header-content {
    height: 60px;
  }
  
  /* 네비게이션 숨김 규칙 제거 - 이제 모바일에서도 네비게이션이 보입니다 */
  .header-nav {
    gap: var(--spacing-md); /* 모바일에서는 간격을 좀 더 줄임 */
  }
  
  .logo-text {
    font-size: var(--font-lg);
  }
  
  .user-name {
    display: none;
  }
  
  /* 모바일에서 네비게이션 링크 크기 조정 */
  .nav-link {
    font-size: var(--font-sm);
  }
  
  /* 모바일에서 로그인 버튼 크기 조정 */
  .custom-login-button {
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 매우 작은 화면에서의 추가 조정 */
@media (max-width: 480px) {
  .header-nav {
    gap: var(--spacing-sm);
  }
  
  .nav-link {
    font-size: 12px;
  }
  
  .custom-login-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>