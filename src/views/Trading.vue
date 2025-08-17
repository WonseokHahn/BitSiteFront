<template>
  <div class="trading">
    <div class="container">
      <!-- 페이지 헤더 -->
      <div class="trading-header">
        <h1 class="page-title">업비트 자동매매</h1>
        <p class="page-description">
          AI 기반 매매 전략으로 코인 자동매매를 시작하세요
        </p>
      </div>

      <!-- 매매 상태 카드 -->
      <div class="status-section">
        <div class="status-cards">
          <div class="status-card">
            <div class="status-icon running" v-if="isTrading">
              <div class="pulse-dot"></div>
            </div>
            <div class="status-icon stopped" v-else>⏸️</div>
            <div class="status-info">
              <h3>매매 상태</h3>
              <p :class="{ 'text-success': isTrading, 'text-secondary': !isTrading }">
                {{ isTrading ? '실행 중' : '중지됨' }}
              </p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon">💰</div>
            <div class="status-info">
              <h3>총 수익률</h3>
              <p :class="{ 'text-success': totalProfit >= 0, 'text-error': totalProfit < 0 }">
                {{ totalProfit >= 0 ? '+' : '' }}{{ totalProfit.toFixed(2) }}%
              </p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon">📊</div>
            <div class="status-info">
              <h3>활성 전략</h3>
              <p class="text-primary">{{ activeStrategy || '없음' }}</p>
            </div>
          </div>

          <div class="status-card">
            <div class="status-icon">🎯</div>
            <div class="status-info">
              <h3>보유 종목</h3>
              <p>{{ selectedCoins.length }}개</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 전략 선택 섹션 -->
      <div class="strategy-section">
        <div class="section-header">
          <h2>매매 전략 선택</h2>
          <p>원하는 매매 전략을 선택하고 설정하세요</p>
        </div>

        <div class="strategy-cards">
          <div 
            v-for="strategy in strategies" 
            :key="strategy.id"
            class="strategy-card"
            :class="{ 'selected': selectedStrategy === strategy.id }"
            @click="selectStrategy(strategy.id)"
          >
            <div class="strategy-icon">{{ strategy.icon }}</div>
            <h3 class="strategy-name">{{ strategy.name }}</h3>
            <p class="strategy-description">{{ strategy.description }}</p>
            <div class="strategy-stats">
              <div class="stat">
                <span class="stat-label">예상 수익률</span>
                <span class="stat-value text-success">{{ strategy.expectedReturn }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">리스크 레벨</span>
                <span class="stat-value" :class="`risk-${strategy.riskLevel}`">
                  {{ strategy.riskLevel.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 종목 선택 섹션 -->
      <div class="coins-section">
        <div class="section-header">
          <h2>AI 추천 종목</h2>
          <p>AI가 분석한 유망 종목들입니다. 수정하거나 추가/제거할 수 있습니다.</p>
        </div>

        <div class="coins-container">
          <div class="coins-header">
            <button 
              @click="refreshRecommendations" 
              :disabled="loadingCoins"
              class="btn btn-outline btn-sm"
            >
              <span v-if="loadingCoins" class="loading-spinner"></span>
              {{ loadingCoins ? '분석 중...' : 'AI 재분석' }}
            </button>
          </div>

          <div class="coins-grid">
            <div 
              v-for="coin in recommendedCoins" 
              :key="coin.symbol"
              class="coin-card"
              :class="{ 'selected': selectedCoins.includes(coin.symbol) }"
              @click="toggleCoin(coin.symbol)"
            >
              <div class="coin-header">
                <div class="coin-info">
                  <h4 class="coin-name">{{ coin.name }}</h4>
                  <span class="coin-symbol">{{ coin.symbol }}</span>
                </div>
                <div class="coin-price">
                  <span class="current-price">{{ formatPrice(coin.currentPrice) }}</span>
                  <span 
                    class="price-change"
                    :class="{ 'positive': coin.change24h >= 0, 'negative': coin.change24h < 0 }"
                  >
                    {{ coin.change24h >= 0 ? '+' : '' }}{{ coin.change24h.toFixed(2) }}%
                  </span>
                </div>
              </div>
              
              <div class="coin-analysis">
                <div class="analysis-item">
                  <span class="analysis-label">AI 점수</span>
                  <div class="score-bar">
                    <div 
                      class="score-fill" 
                      :style="{ width: coin.aiScore + '%' }"
                      :class="getScoreClass(coin.aiScore)"
                    ></div>
                    <span class="score-text">{{ coin.aiScore }}/100</span>
                  </div>
                </div>
                <p class="coin-reason">{{ coin.reason }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 매매 설정 섹션 -->
      <div class="settings-section">
        <div class="section-header">
          <h2>매매 설정</h2>
          <p>매매 조건과 리스크 관리 설정을 조정하세요</p>
        </div>

        <div class="settings-grid">
          <div class="setting-group">
            <label class="form-label">투자 금액 (KRW)</label>
            <input 
              type="number" 
              v-model.number="settings.investmentAmount"
              class="form-input"
              placeholder="1000000"
              min="10000"
              step="10000"
            >
          </div>

          <div class="setting-group">
            <label class="form-label">손절 비율 (%)</label>
            <input 
              type="number" 
              v-model.number="settings.stopLoss"
              class="form-input"
              placeholder="5"
              min="1"
              max="50"
              step="0.5"
            >
          </div>

          <div class="setting-group">
            <label class="form-label">익절 비율 (%)</label>
            <input 
              type="number" 
              v-model.number="settings.takeProfit"
              class="form-input"
              placeholder="10"
              min="1"
              max="100"
              step="0.5"
            >
          </div>

          <div class="setting-group">
            <label class="form-label">매매 간격 (초)</label>
            <select v-model="settings.tradingInterval" class="form-select">
              <option value="30">30초</option>
              <option value="60">1분</option>
              <option value="300">5분</option>
              <option value="600">10분</option>
              <option value="1800">30분</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 매매 제어 버튼 -->
      <div class="control-section">
        <div class="control-buttons">
          <button 
            v-if="!isTrading"
            @click="startTrading"
            :disabled="!canStartTrading"
            class="btn btn-success btn-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            자동매매 시작
          </button>

          <button 
            v-if="isTrading"
            @click="stopTrading"
            class="btn btn-danger btn-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h12v12H6z"/>
            </svg>
            자동매매 중지
          </button>

          <button 
            @click="showLogs = !showLogs"
            class="btn btn-outline btn-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
            매매 로그
          </button>
        </div>

        <div class="control-info">
          <div v-if="!canStartTrading" class="alert alert-warning">
            매매를 시작하려면 전략과 종목을 선택해주세요.
          </div>
          <div v-if="isTrading" class="alert alert-info">
            자동매매가 실행 중입니다. 시장 상황에 따라 매매가 진행됩니다.
          </div>
        </div>
      </div>

      <!-- 매매 로그 섹션 -->
      <div v-if="showLogs" class="logs-section">
        <div class="section-header">
          <h2>매매 로그</h2>
          <p>최근 매매 내역과 시스템 로그를 확인하세요</p>
        </div>

        <div class="logs-container">
          <div class="logs-tabs">
            <button 
              @click="activeLogTab = 'trades'"
              :class="{ 'active': activeLogTab === 'trades' }"
              class="log-tab"
            >
              매매 내역
            </button>
            <button 
              @click="activeLogTab = 'system'"
              :class="{ 'active': activeLogTab === 'system' }"
              class="log-tab"
            >
              시스템 로그
            </button>
          </div>

          <div class="logs-content">
            <div v-if="activeLogTab === 'trades'" class="trades-log">
              <div v-if="tradeLogs.length === 0" class="empty-logs">
                아직 매매 내역이 없습니다.
              </div>
              <div v-else class="log-list">
                <div 
                  v-for="log in tradeLogs" 
                  :key="log.id"
                  class="log-item trade-log"
                >
                  <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  <div class="log-content">
                    <span class="trade-type" :class="log.type">{{ log.type.toUpperCase() }}</span>
                    <span class="trade-symbol">{{ log.symbol }}</span>
                    <span class="trade-amount">{{ log.amount }} {{ log.symbol.split('_')[0] }}</span>
                    <span class="trade-price">@ {{ formatPrice(log.price) }}</span>
                  </div>
                  <div 
                    class="log-result"
                    :class="{ 'profit': log.profit > 0, 'loss': log.profit < 0 }"
                  >
                    {{ log.profit > 0 ? '+' : '' }}{{ log.profit.toFixed(2) }}%
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeLogTab === 'system'" class="system-log">
              <div v-if="systemLogs.length === 0" class="empty-logs">
                시스템 로그가 없습니다.
              </div>
              <div v-else class="log-list">
                <div 
                  v-for="log in systemLogs" 
                  :key="log.id"
                  class="log-item system-log"
                >
                  <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  <div class="log-content">
                    <span class="log-level" :class="log.level">{{ log.level }}</span>
                    <span class="log-message">{{ log.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TradingPage',
  data() {
    return {
      selectedStrategy: null,
      selectedCoins: [],
      isTrading: false,
      loadingCoins: false,
      showLogs: false,
      activeLogTab: 'trades',
      totalProfit: 2.45,
      
      settings: {
        investmentAmount: 1000000,
        stopLoss: 5,
        takeProfit: 10,
        tradingInterval: 60
      },
      
      strategies: [
        {
          id: 'momentum',
          name: '모멘텀 전략',
          icon: '🚀',
          description: '가격 상승 추세를 포착하여 매매하는 전략입니다. RSI와 MACD를 활용합니다.',
          expectedReturn: '8-15%',
          riskLevel: 'medium'
        },
        {
          id: 'meanReversion',
          name: '평균회귀 전략',
          icon: '📈',
          description: '과매도/과매수 구간을 찾아 역추세 매매를 하는 전략입니다.',
          expectedReturn: '5-12%',
          riskLevel: 'low'
        },
        {
          id: 'volatilityBreakout',
          name: '변동성 돌파 전략',
          icon: '⚡',
          description: '변동성 확장 구간에서 돌파를 포착하는 공격적인 전략입니다.',
          expectedReturn: '10-25%',
          riskLevel: 'high'
        }
      ],
      
      recommendedCoins: [
        {
          symbol: 'BTC_KRW',
          name: '비트코인',
          currentPrice: 45600000,
          change24h: 2.34,
          aiScore: 87,
          reason: '기관 투자 증가와 기술적 강세 신호 감지'
        },
        {
          symbol: 'ETH_KRW',
          name: '이더리움',
          currentPrice: 2850000,
          change24h: -1.22,
          aiScore: 82,
          reason: 'DeFi 생태계 성장과 업그레이드 기대감'
        },
        {
          symbol: 'ADA_KRW',
          name: '에이다',
          currentPrice: 580,
          change24h: 5.67,
          aiScore: 75,
          reason: '스마트 컨트랙트 활용도 증가 추세'
        },
        {
          symbol: 'DOT_KRW',
          name: '폴카닷',
          currentPrice: 8900,
          change24h: 3.45,
          aiScore: 73,
          reason: '크로스체인 기술 발전과 파라체인 확장'
        },
        {
          symbol: 'MATIC_KRW',
          name: '폴리곤',
          currentPrice: 1250,
          change24h: -2.11,
          aiScore: 78,
          reason: '레이어2 솔루션으로서의 채택률 증가'
        }
      ],
      
      tradeLogs: [],
      systemLogs: []
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    
    activeStrategy() {
      if (!this.selectedStrategy) return null
      return this.strategies.find(s => s.id === this.selectedStrategy)?.name
    },
    
    canStartTrading() {
      return this.selectedStrategy && this.selectedCoins.length > 0 && !this.isTrading
    }
  },
  
  methods: {
    ...mapActions('trading', ['initializeTrading', 'startTradingSession', 'stopTradingSession']),
    
    selectStrategy(strategyId) {
      this.selectedStrategy = strategyId
      this.addSystemLog('info', `전략 선택: ${this.strategies.find(s => s.id === strategyId).name}`)
    },
    
    toggleCoin(symbol) {
      const index = this.selectedCoins.indexOf(symbol)
      if (index > -1) {
        this.selectedCoins.splice(index, 1)
      } else {
        this.selectedCoins.push(symbol)
      }
    },
    
    async refreshRecommendations() {
      this.loadingCoins = true
      this.addSystemLog('info', 'AI 종목 분석을 시작합니다...')
      
      try {
        // 실제로는 API 호출
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // AI 점수 재계산 (시뮬레이션)
        this.recommendedCoins.forEach(coin => {
          coin.aiScore = Math.floor(Math.random() * 30) + 70
          coin.change24h = (Math.random() - 0.5) * 10
        })
        
        this.addSystemLog('success', 'AI 종목 분석이 완료되었습니다.')
      } catch (error) {
        this.addSystemLog('error', 'AI 분석 중 오류가 발생했습니다.')
      } finally {
        this.loadingCoins = false
      }
    },
    
    async startTrading() {
      if (!this.canStartTrading) return
      
      this.isTrading = true
      this.addSystemLog('info', `자동매매를 시작합니다. 전략: ${this.activeStrategy}`)
      this.addSystemLog('info', `선택 종목: ${this.selectedCoins.join(', ')}`)
      
      // 매매 시뮬레이션 시작
      this.simulateTrading()
    },
    
    stopTrading() {
      this.isTrading = false
      this.addSystemLog('warning', '자동매매를 중지했습니다.')
    },
    
    simulateTrading() {
      if (!this.isTrading) return
      
      // 매매 시뮬레이션 (실제로는 업비트 API 연동)
      setTimeout(() => {
        if (this.isTrading && Math.random() > 0.7) {
          this.simulateTrade()
        }
        this.simulateTrading()
      }, this.settings.tradingInterval * 1000)
    },
    
    simulateTrade() {
      const coin = this.selectedCoins[Math.floor(Math.random() * this.selectedCoins.length)]
      const type = Math.random() > 0.5 ? 'buy' : 'sell'
      const coinData = this.recommendedCoins.find(c => c.symbol === coin)
      
      if (coinData) {
        const trade = {
          id: Date.now(),
          timestamp: new Date(),
          type,
          symbol: coin,
          amount: (Math.random() * 0.1 + 0.01).toFixed(4),
          price: coinData.currentPrice,
          profit: (Math.random() - 0.4) * 5
        }
        
        this.tradeLogs.unshift(trade)
        if (this.tradeLogs.length > 50) {
          this.tradeLogs = this.tradeLogs.slice(0, 50)
        }
        
        this.addSystemLog('info', `${type.toUpperCase()} ${trade.symbol} ${trade.amount}`)
      }
    },
    
    addSystemLog(level, message) {
      const log = {
        id: Date.now(),
        timestamp: new Date(),
        level,
        message
      }
      
      this.systemLogs.unshift(log)
      if (this.systemLogs.length > 100) {
        this.systemLogs = this.systemLogs.slice(0, 100)
      }
    },
    
    formatPrice(price) {
      if (price >= 1000000) {
        return (price / 1000000).toFixed(1) + 'M'
      } else if (price >= 1000) {
        return (price / 1000).toFixed(1) + 'K'
      }
      return price.toLocaleString()
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('ko-KR')
    },
    
    getScoreClass(score) {
      if (score >= 80) return 'high'
      if (score >= 60) return 'medium'
      return 'low'
    }
  },
  
  mounted() {
    // 페이지 로드시 기본 종목 선택
    this.selectedCoins = ['BTC_KRW', 'ETH_KRW', 'ADA_KRW']
    this.addSystemLog('info', '자동매매 시스템에 접속했습니다.')
  }
}
</script>

<style scoped>
.trading {
  padding: var(--spacing-xl) 0;
  background-color: var(--bg-secondary);
  min-height: calc(100vh - 70px);
}

.trading-header {
  text-align: center;
  margin-bottom: var(--spacing-xxl);
}

.page-title {
  font-size: var(--font-xxl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.page-description {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* 상태 카드 */
.status-section {
  margin-bottom: var(--spacing-xxl);
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.status-card {
  background: var(--white);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.status-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--bg-secondary);
}

.status-icon.running {
  background-color: var(--success-color);
  position: relative;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background-color: var(--white);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.status-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-md);
  font-weight: var(--font-medium);
}

.status-info p {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
}

/* 섹션 공통 스타일 */
.section-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.section-header h2 {
  font-size: var(--font-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.section-header p {
  color: var(--text-secondary);
  margin: 0;
}

/* 전략 카드 */
.strategy-section {
  margin-bottom: var(--spacing-xxl);
}

.strategy-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.strategy-card {
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  text-align: center;
}

.strategy-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.strategy-card.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 20px rgba(25, 118, 210, 0.2);
}

.strategy-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.strategy-name {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.strategy-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
}

.strategy-stats {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-weight: var(--font-bold);
  font-size: var(--font-sm);
}

.risk-low { color: var(--success-color); }
.risk-medium { color: var(--warning-color); }
.risk-high { color: var(--error-color); }

/* 종목 카드 */
.coins-section {
  margin-bottom: var(--spacing-xxl);
}

.coins-container {
  background: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
}

.coins-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.coins-grid {
  display: grid;
  gap: var(--spacing-md);
}

.coin-card {
  padding: var(--spacing-lg);
  border: 2px solid var(--border-light);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.coin-card:hover {
  border-color: var(--primary-color);
}

.coin-card.selected {
  border-color: var(--primary-color);
  background-color: rgba(25, 118, 210, 0.05);
}

.coin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.coin-name {
  font-size: var(--font-md);
  font-weight: var(--font-medium);
  margin: 0 0 var(--spacing-xs) 0;
}

.coin-symbol {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.coin-price {
  text-align: right;
}

.current-price {
  display: block;
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-xs);
}

.price-change.positive { color: var(--success-color); }
.price-change.negative { color: var(--error-color); }

.coin-analysis {
  margin-top: var(--spacing-md);
}

.analysis-item {
  margin-bottom: var(--spacing-sm);
}

.analysis-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.score-bar {
  position: relative;
  height: 20px;
  background-color: var(--light-gray);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--spacing-xs);
}

.score-fill.high { background-color: var(--success-color); }
.score-fill.medium { background-color: var(--warning-color); }
.score-fill.low { background-color: var(--error-color); }

.score-text {
  font-size: var(--font-xs);
  color: var(--white);
  font-weight: var(--font-bold);
}

.coin-reason {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* 설정 섹션 */
.settings-section {
  margin-bottom: var(--spacing-xxl);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  background: var(--white);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.setting-group {
  display: flex;
  flex-direction: column;
}

/* 제어 버튼 */
.control-section {
  margin-bottom: var(--spacing-xxl);
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.control-info {
  max-width: 600px;
  margin: 0 auto;
}

/* 로그 섹션 */
.logs-section {
  background: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.logs-container {
  padding: var(--spacing-xl);
}

.logs-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--spacing-lg);
}

.log-tab {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: none;
  cursor: pointer;
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.log-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.log-tab:hover {
  color: var(--primary-color);
}

.logs-content {
  max-height: 400px;
  overflow-y: auto;
}

.empty-logs {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xxl) 0;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.log-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
}

.log-time {
  min-width: 80px;
  color: var(--text-secondary);
  font-family: monospace;
}

.log-content {
  flex: 1;
  margin: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.trade-type,
.log-level {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.trade-type.buy,
.log-level.info {
  background-color: var(--success-color);
  color: var(--white);
}

.trade-type.sell,
.log-level.warning {
  background-color: var(--warning-color);
  color: var(--white);
}

.log-level.error {
  background-color: var(--error-color);
  color: var(--white);
}

.log-level.success {
  background-color: var(--success-color);
  color: var(--white);
}

.trade-symbol {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.trade-amount,
.trade-price {
  color: var(--text-secondary);
}

.log-result {
  min-width: 60px;
  text-align: right;
  font-weight: var(--font-bold);
}

.log-result.profit {
  color: var(--success-color);
}

.log-result.loss {
  color: var(--error-color);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .status-cards {
    grid-template-columns: 1fr;
  }
  
  .strategy-cards {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .control-buttons .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .log-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .log-time {
    min-width: auto;
  }
  
  .log-content {
    margin: 0;
    flex-wrap: wrap;
  }
  
  .log-result {
    min-width: auto;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .trading {
    padding: var(--spacing-lg) 0;
  }
  
  .coins-container,
  .settings-grid,
  .logs-container {
    padding: var(--spacing-lg);
  }
  
  .coin-header {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .coin-price {
    text-align: left;
  }
}
</style>