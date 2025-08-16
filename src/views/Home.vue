<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            AI 기반 놀이터
          </h1>
          <p class="hero-subtitle">
            실시간 뉴스 분석과 AI 요약 주식 자동화
          </p>
          
          <!-- 검색 섹션 -->
          <div class="search-section">
            <div class="search-container">
              <div class="search-input-group">
                <input 
                  type="text" 
                  v-model="searchKeyword"
                  @keypress.enter="handleSearch"
                  placeholder="종목명 또는 키워드를 입력하세요 (예: 삼성전자, AI, 전기차)"
                  class="search-input"
                >
                <button 
                  @click="handleSearch"
                  :disabled="isSearching || !searchKeyword.trim()"
                  class="search-button"
                >
                  <span v-if="isSearching" class="loading-spinner"></span>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  검색
                </button>
              </div>
              
              <div class="search-suggestions">
                <span class="suggestion-label">인기 검색어:</span>
                <button 
                  v-for="keyword in popularKeywords" 
                  :key="keyword"
                  @click="searchByKeyword(keyword)"
                  class="suggestion-tag"
                >
                  {{ keyword }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- News Results Section -->
    <section v-if="hasSearched" class="news-results">
      <div class="container">
        <div class="results-header">
          <h2 class="results-title">
            <span v-if="searchKeyword">"{{ searchKeyword }}" 검색 결과</span>
            <span v-else>뉴스 검색 결과</span>
          </h2>
          
          <div class="results-meta">
            <span v-if="!isSearching && hasArticles" class="results-count">
              총 {{ articles.length }}개의 기사
            </span>
            <button 
              v-if="hasArticles"
              @click="clearResults"
              class="btn btn-sm btn-outline"
            >
              검색 초기화
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isSearching" class="loading-state">
          <div class="loading-spinner-large"></div>
          <p>뉴스를 검색하고 AI 요약을 생성하는 중...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="!hasArticles && hasSearched" class="no-results">
          <div class="no-results-icon">📰</div>
          <h3>검색 결과가 없습니다</h3>
          <p>다른 키워드로 검색해보세요</p>
        </div>

        <!-- News Articles -->
        <div v-else-if="hasArticles" class="news-grid">
          <NewsCard 
            v-for="(article, index) in articles" 
            :key="index"
            :article="article"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section v-if="!hasSearched" class="features">
      <div class="container">
        <h2 class="section-title">주요 기능</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3 class="feature-title">실시간 뉴스 검색</h3>
            <p class="feature-description">
              네이버 뉴스에서 실시간으로 관련 뉴스를 검색하고 최신 정보를 제공합니다.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3 class="feature-title">AI 뉴스 요약</h3>
            <p class="feature-description">
              GPT를 활용하여 복잡한 뉴스 내용을 간결하고 이해하기 쉽게 요약합니다.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3 class="feature-title">자동매매 시스템</h3>
            <p class="feature-description">
              로그인 후 AI 기반 자동매매 전략을 설정하고 실행할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section v-if="!isAuthenticated && !hasSearched" class="cta">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">지금 시작하세요</h2>
          <p class="cta-description">
            로그인하고 AI 기반 자동매매 서비스를 이용해보세요
          </p>
          <!-- <router-link to="/login" class="btn btn-primary btn-lg">
            로그인하기
          </router-link> -->
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import NewsCard from '@/components/NewsCard.vue'

export default {
  name: 'HomePage',
  components: {
    NewsCard
  },
  data() {
    return {
      searchKeyword: '',
      hasSearched: false,
      popularKeywords: ['삼성전자', '양자컴퓨터', '전기차', '반도체', '트럼프', '테슬라', '비트코인']
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('news', ['articles', 'isLoading', 'hasArticles']),
    
    isSearching() {
      return this.isLoading
    }
  },
  methods: {
    ...mapActions('news', ['searchNews', 'clearNews']),
    
    async handleSearch() {
      if (!this.searchKeyword.trim()) return
      
      this.hasSearched = true
      await this.searchNews(this.searchKeyword.trim())
    },
    
    async searchByKeyword(keyword) {
      this.searchKeyword = keyword
      await this.handleSearch()
    },
    
    clearResults() {
      this.hasSearched = false
      this.searchKeyword = ''
      this.clearNews()
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
  padding: var(--spacing-xxl) 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xxl);
  opacity: 0.9;
  line-height: 1.5;
  color: #ffffff; /* 흰색 */

}

.search-section {
  margin-top: var(--spacing-xxl);
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-group {
  display: flex;
  background-color: var(--white);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-md);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: var(--spacing-md);
  font-size: var(--font-md);
  color: var(--text-primary);
  background: transparent;
}

.search-input::placeholder {
  color: var(--gray);
}

.search-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.search-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-suggestions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: center;
}

.suggestion-label {
  font-size: var(--font-sm);
  opacity: 0.8;
  margin-right: var(--spacing-sm);
}

.suggestion-tag {
  background-color: rgba(255, 255, 255, 0.2);
  color: var(--white);
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.suggestion-tag:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.news-results {
  padding: var(--spacing-xxl) 0;
  background-color: var(--bg-secondary);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xxl);
}

.results-title {
  font-size: var(--font-xxl);
  color: var(--text-primary);
  margin: 0;
}

.results-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.results-count {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.loading-spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto var(--spacing-md);
}

.no-results {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.news-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.features {
  padding: var(--spacing-xxl) 0;
  background-color: var(--white);
}

.section-title {
  text-align: center;
  font-size: var(--font-xxl);
  margin-bottom: var(--spacing-xxl);
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.feature-card {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.feature-title {
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.cta {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--white);
  padding: var(--spacing-xxl) 0;
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: var(--font-xxl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
}

.cta-description {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xl);
  opacity: 0.9;
  color: #000000; /* 흰색 */

}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: var(--font-md);
    color: #ffffff; /* 흰색 */

  }
  
  .search-input-group {
    flex-direction: column;
    padding: var(--spacing-sm);
  }
  
  .search-button {
    margin-top: var(--spacing-sm);
    justify-content: center;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .results-title {
    font-size: var(--font-xl);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestion-tag {
    font-size: var(--font-xs);
  }
}
</style>
