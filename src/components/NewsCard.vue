<template>
  <div class="news-card">
    <div class="news-header">
      <h3 class="news-title">
        <a 
          :href="article.link" 
          target="_blank" 
          rel="noopener noreferrer"
          class="news-link"
        >
          {{ article.title }}
        </a>
      </h3>
      <div class="news-meta">
        <span class="news-source">{{ article.source }}</span>
        <span class="news-date">{{ formatDate(article.publishedAt) }}</span>
      </div>
    </div>
    
    <div class="news-body">
      <p class="news-description">{{ article.description }}</p>
      
      <div class="news-summary">
        <div class="summary-header">
          <span class="summary-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            AI 요약
          </span>
        </div>
        <p class="summary-text">{{ article.summary }}</p>
      </div>
    </div>
    
    <!-- <div class="news-footer">
      <button 
        @click="toggleExpanded"
        class="btn btn-sm btn-outline"
      >
        {{ isExpanded ? '접기' : '더보기' }}
      </button>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'NewsCard',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  methods: {
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)
        
        if (diffMins < 1) return '방금 전'
        if (diffMins < 60) return `${diffMins}분 전`
        if (diffHours < 24) return `${diffHours}시간 전`
        if (diffDays < 7) return `${diffDays}일 전`
        
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
.news-card {
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
  margin-bottom: var(--spacing-md);
}

.news-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.news-header {
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
}

.news-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-lg);
  font-weight: var(--font-medium);
  line-height: 1.4;
}

.news-link {
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.news-link:hover {
  color: var(--primary-color);
}

.news-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.news-source {
  font-weight: var(--font-medium);
  color: var(--primary-color);
}

.news-date {
  position: relative;
}

.news-date::before {
  content: '•';
  margin-right: var(--spacing-xs);
  color: var(--gray);
}

.news-body {
  padding: 0 var(--spacing-lg) var(--spacing-md);
}

.news-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.news-summary {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  border-left: 4px solid var(--primary-color);
}

.summary-header {
  margin-bottom: var(--spacing-sm);
}

.summary-label {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--primary-color);
}

.summary-text {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: var(--font-sm);
}

.news-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
}

/* 확장/축소 애니메이션 */
.news-body {
  transition: max-height var(--transition-normal);
}

.news-card:not(.expanded) .news-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  /* 표준 속성도 함께 정의해 호환성 확보 */
  line-clamp: 3;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .news-header,
  .news-body,
  .news-footer {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
  
  .news-title {
    font-size: var(--font-md);
  }
  
  .news-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .news-date::before {
    display: none;
  }
}
</style>