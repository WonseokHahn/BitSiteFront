import apiClient from '@/utils/api'
import { useToast } from 'vue-toastification'

// 매매 전략 구현
const strategies = {
  // 1. 모멘텀 전략 (RSI + MACD + 이동평균)
  momentum: {
    name: '모멘텀 전략',
    description: 'RSI와 MACD를 활용한 추세 추종 전략',
    
    // 매수 조건: RSI > 30 && MACD > Signal && 상승 추세
    shouldBuy(candle, indicators) {
      const { rsi, macd, macdSignal, ema20, ema50 } = indicators
      return (
        rsi > 30 && rsi < 70 &&
        macd > macdSignal &&
        candle.close > ema20 &&
        ema20 > ema50
      )
    },
    
    // 매도 조건: RSI > 70 || MACD < Signal || 하락 추세
    shouldSell(candle, indicators, position) {
      const { rsi, macd, macdSignal } = indicators
      const profitRate = ((candle.close - position.avgPrice) / position.avgPrice) * 100
      
      return (
        rsi > 70 ||
        macd < macdSignal ||
        profitRate > 10 || // 10% 익절
        profitRate < -5    // 5% 손절
      )
    }
  },

  // 2. 평균회귀 전략 (볼린저 밴드 + RSI)
  meanReversion: {
    name: '평균회귀 전략',
    description: '볼린저 밴드와 RSI를 활용한 역추세 전략',
    
    // 매수 조건: 가격이 하단 밴드 근처 && RSI < 30 (과매도)
    shouldBuy(candle, indicators) {
      const { rsi, bollingerLower, bollingerMiddle } = indicators
      const distanceFromLower = (candle.close - bollingerLower) / bollingerLower
      
      return (
        rsi < 30 &&
        distanceFromLower < 0.02 && // 하단 밴드 2% 이내
        candle.close < bollingerMiddle
      )
    },
    
    // 매도 조건: 가격이 상단 밴드 근처 || RSI > 70 (과매수)
    shouldSell(candle, indicators, position) {
      const { rsi, bollingerUpper, bollingerMiddle } = indicators
      const distanceFromUpper = (bollingerUpper - candle.close) / bollingerUpper
      const profitRate = ((candle.close - position.avgPrice) / position.avgPrice) * 100
      
      return (
        rsi > 70 ||
        distanceFromUpper < 0.02 || // 상단 밴드 2% 이내
        candle.close > bollingerMiddle ||
        profitRate > 8 || // 8% 익절
        profitRate < -4   // 4% 손절
      )
    }
  },

  // 3. 변동성 돌파 전략 (볼린저 밴드 폭 + 거래량)
  volatilityBreakout: {
    name: '변동성 돌파 전략',
    description: '변동성 확장과 거래량을 활용한 돌파 전략',
    
    // 매수 조건: 볼린저 밴드 폭 확장 && 상향 돌파 && 거래량 증가
    shouldBuy(candle, indicators) {
      const { bollingerUpper, bollingerWidth, bollingerWidthMA, volumeMA, rsi } = indicators
      const prevCandle = indicators.prevCandle
      
      return (
        bollingerWidth > bollingerWidthMA * 1.2 && // 변동성 확장
        candle.close > bollingerUpper && // 상향 돌파
        candle.volume > volumeMA * 1.5 && // 거래량 증가
        rsi > 50 && // 모멘텀 확인
        prevCandle && candle.close > prevCandle.high // 신고점 돌파
      )
    },
    
    // 매도 조건: 변동성 축소 || 하향 돌파 || 높은 수익률
    shouldSell(candle, indicators, position) {
      const { bollingerLower, bollingerWidth, bollingerWidthMA, rsi } = indicators
      const profitRate = ((candle.close - position.avgPrice) / position.avgPrice) * 100
      
      return (
        candle.close < bollingerLower || // 하향 돌파
        bollingerWidth < bollingerWidthMA * 0.8 || // 변동성 축소
        rsi < 30 || // 과매도
        profitRate > 15 || // 15% 익절
        profitRate < -7    // 7% 손절
      )
    }
  }
}

const state = {
  // 매매 상태
  isTrading: false,
  activeStrategy: null,
  selectedCoins: [],
  
  // 매매 설정
  settings: {
    investmentAmount: 1000000,
    stopLoss: 5,
    takeProfit: 10,
    tradingInterval: 60,
    maxPositions: 5
  },
  
  // 포지션 관리
  positions: [],
  
  // 매매 기록
  tradingHistory: [],
  
  // 실시간 데이터
  marketData: {},
  
  // 성과 데이터
  performance: {
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0,
    dailyPnL: []
  },
  
  // 로딩 상태
  loading: {
    starting: false,
    stopping: false,
    analyzing: false
  }
}

const mutations = {
  SET_TRADING_STATUS(state, status) {
    state.isTrading = status
  },
  
  SET_ACTIVE_STRATEGY(state, strategy) {
    state.activeStrategy = strategy
  },
  
  SET_SELECTED_COINS(state, coins) {
    state.selectedCoins = coins
  },
  
  UPDATE_SETTINGS(state, settings) {
    state.settings = { ...state.settings, ...settings }
  },
  
  ADD_POSITION(state, position) {
    state.positions.push(position)
  },
  
  UPDATE_POSITION(state, { symbol, updates }) {
    const position = state.positions.find(p => p.symbol === symbol)
    if (position) {
      Object.assign(position, updates)
    }
  },
  
  REMOVE_POSITION(state, symbol) {
    state.positions = state.positions.filter(p => p.symbol !== symbol)
  },
  
  ADD_TRADE_RECORD(state, trade) {
    state.tradingHistory.unshift(trade)
    // 최대 1000개 기록 유지
    if (state.tradingHistory.length > 1000) {
      state.tradingHistory = state.tradingHistory.slice(0, 1000)
    }
  },
  
  UPDATE_MARKET_DATA(state, { symbol, data }) {
    state.marketData[symbol] = data
  },
  
  UPDATE_PERFORMANCE(state, performance) {
    state.performance = { ...state.performance, ...performance }
  },
  
  SET_LOADING(state, { type, status }) {
    state.loading[type] = status
  }
}

const actions = {
  // 자동매매 시작
  async startTrading({ commit, state, dispatch }) {
    if (state.isTrading) return
    
    try {
      commit('SET_LOADING', { type: 'starting', status: true })
      
      // 서버에 매매 시작 요청
      const response = await apiClient.post('/trading/start', {
        strategy: state.activeStrategy,
        coins: state.selectedCoins,
        settings: state.settings
      })
      
      if (response.data.success) {
        commit('SET_TRADING_STATUS', true)
        
        // 실시간 데이터 수신 시작
        dispatch('startRealtimeData')
        
        // 매매 로직 실행 시작
        dispatch('runTradingLoop')
        
        const toast = useToast()
        toast.success('자동매매가 시작되었습니다!')
      }
    } catch (error) {
      console.error('매매 시작 실패:', error)
      const toast = useToast()
      toast.error('매매 시작에 실패했습니다.')
    } finally {
      commit('SET_LOADING', { type: 'starting', status: false })
    }
  },
  
  // 자동매매 중지
  async stopTrading({ commit, state, dispatch }) {
    if (!state.isTrading) return
    
    try {
      commit('SET_LOADING', { type: 'stopping', status: true })
      
      // 서버에 매매 중지 요청
      await apiClient.post('/trading/stop')
      
      commit('SET_TRADING_STATUS', false)
      
      // 실시간 데이터 중지
      dispatch('stopRealtimeData')
      
      const toast = useToast()
      toast.success('자동매매가 중지되었습니다.')
    } catch (error) {
      console.error('매매 중지 실패:', error)
      const toast = useToast()
      toast.error('매매 중지에 실패했습니다.')
    } finally {
      commit('SET_LOADING', { type: 'stopping', status: false })
    }
  },
  
  // 실시간 데이터 수신 시작
  startRealtimeData({ commit, state }) {
    // WebSocket 또는 SSE로 실시간 데이터 수신
    // 여기서는 시뮬레이션으로 구현
    state.realtimeInterval = setInterval(() => {
      state.selectedCoins.forEach(symbol => {
        const mockData = generateMockMarketData(symbol)
        commit('UPDATE_MARKET_DATA', { symbol, data: mockData })
      })
    }, 1000)
  },
  
  // 실시간 데이터 중지
  stopRealtimeData({ state }) {
    if (state.realtimeInterval) {
      clearInterval(state.realtimeInterval)
      state.realtimeInterval = null
    }
  },
  
  // 매매 로직 실행 루프
  async runTradingLoop({ state, dispatch }) {
    if (!state.isTrading) return
    
    try {
      // 각 선택된 코인에 대해 매매 로직 실행
      for (const symbol of state.selectedCoins) {
        await dispatch('executeTrading', symbol)
      }
    } catch (error) {
      console.error('매매 실행 오류:', error)
    }
    
    // 다음 실행 예약
    setTimeout(() => {
      if (state.isTrading) {
        dispatch('runTradingLoop')
      }
    }, state.settings.tradingInterval * 1000)
  },
  
  // 개별 코인 매매 실행
  async executeTrading({ state, commit, dispatch }, symbol) {
    try {
      // 현재 시장 데이터 가져오기
      const marketData = state.marketData[symbol]
      if (!marketData) return
      
      // 기술적 지표 계산
      const indicators = await dispatch('calculateIndicators', { symbol })
      
      // 현재 포지션 확인
      const currentPosition = state.positions.find(p => p.symbol === symbol)
      
      // 전략에 따른 매매 신호 확인
      const strategy = strategies[state.activeStrategy]
      if (!strategy) return
      
      if (!currentPosition) {
        // 포지션이 없는 경우 - 매수 신호 확인
        if (strategy.shouldBuy(marketData.candle, indicators)) {
          await dispatch('executeBuy', { symbol, price: marketData.candle.close })
        }
      } else {
        // 포지션이 있는 경우 - 매도 신호 확인
        if (strategy.shouldSell(marketData.candle, indicators, currentPosition)) {
          await dispatch('executeSell', { symbol, price: marketData.candle.close })
        }
      }
    } catch (error) {
      console.error(`${symbol} 매매 실행 오류:`, error)
    }
  },
  
  // 매수 실행
  async executeBuy({ state, commit }, { symbol, price }) {
    try {
      // 투자 금액 계산
      const investAmount = state.settings.investmentAmount / state.selectedCoins.length
      const quantity = investAmount / price
      
      // 실제 주문 실행 (업비트 API)
      const response = await apiClient.post('/trading/buy', {
        symbol,
        price,
        quantity
      })
      
      if (response.data.success) {
        // 포지션 추가
        const position = {
          symbol,
          type: 'long',
          quantity,
          avgPrice: price,
          entryTime: new Date(),
          unrealizedPnL: 0
        }
        commit('ADD_POSITION', position)
        
        // 거래 기록 추가
        const trade = {
          id: Date.now(),
          symbol,
          type: 'buy',
          price,
          quantity,
          timestamp: new Date(),
          strategy: state.activeStrategy
        }
        commit('ADD_TRADE_RECORD', trade)
        
        console.log(`매수 완료: ${symbol} @ ${price}`)
      }
    } catch (error) {
      console.error('매수 실행 실패:', error)
    }
  },
  
  // 매도 실행
  async executeSell({ state, commit }, { symbol, price }) {
    try {
      const position = state.positions.find(p => p.symbol === symbol)
      if (!position) return
      
      // 실제 주문 실행 (업비트 API)
      const response = await apiClient.post('/trading/sell', {
        symbol,
        price,
        quantity: position.quantity
      })
      
      if (response.data.success) {
        // 수익률 계산
        const profit = ((price - position.avgPrice) / position.avgPrice) * 100
        
        // 포지션 제거
        commit('REMOVE_POSITION', symbol)
        
        // 거래 기록 추가
        const trade = {
          id: Date.now(),
          symbol,
          type: 'sell',
          price,
          quantity: position.quantity,
          profit,
          timestamp: new Date(),
          strategy: state.activeStrategy
        }
        commit('ADD_TRADE_RECORD', trade)
        
        console.log(`매도 완료: ${symbol} @ ${price} (${profit.toFixed(2)}%)`)
      }
    } catch (error) {
      console.error('매도 실행 실패:', error)
    }
  },
  
  // 기술적 지표 계산
  async calculateIndicators(_, { symbol }) {
    try {
      // 캔들 데이터 가져오기 (최근 200개)
      const response = await apiClient.get(`/trading/candles/${symbol}`, {
        params: { count: 200 }
      })
      
      const candles = response.data.candles || []
      
      // 각종 지표 계산
      const indicators = {
        // RSI (14기간)
        rsi: calculateRSI(candles, 14),
        
        // MACD (12, 26, 9)
        ...calculateMACD(candles, 12, 26, 9),
        
        // 볼린저 밴드 (20, 2)
        ...calculateBollingerBands(candles, 20, 2),
        
        // 이동평균선
        ema20: calculateEMA(candles, 20),
        ema50: calculateEMA(candles, 50),
        
        // 거래량 평균
        volumeMA: calculateVolumeMA(candles, 20),
        
        // 이전 캔들 정보
        prevCandle: candles[candles.length - 2]
      }
      
      return indicators
    } catch (error) {
      console.error('지표 계산 실패:', error)
      return {}
    }
  },
  
  // AI 종목 추천 갱신
  async refreshAIRecommendations({ commit }) {
    try {
      commit('SET_LOADING', { type: 'analyzing', status: true })
      
      const response = await apiClient.get('/trading/ai-recommendations')
      
      if (response.data.success) {
        return response.data.recommendations
      }
    } catch (error) {
      console.error('AI 추천 갱신 실패:', error)
      return []
    } finally {
      commit('SET_LOADING', { type: 'analyzing', status: false })
    }
  }
}

const getters = {
  isTrading: state => state.isTrading,
  activeStrategy: state => state.activeStrategy,
  selectedCoins: state => state.selectedCoins,
  positions: state => state.positions,
  tradingHistory: state => state.tradingHistory,
  performance: state => state.performance,
  isLoading: state => type => state.loading[type] || false
}

// 기술적 지표 계산 함수들
function calculateRSI(candles, period = 14) {
  if (candles.length < period + 1) return 50
  
  let gains = 0
  let losses = 0
  
  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close
    if (change > 0) gains += change
    else losses -= change
  }
  
  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateMACD(candles, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(candles, fast)
  const emaSlow = calculateEMA(candles, slow)
  const macd = emaFast - emaSlow
  
  // Signal line은 MACD의 EMA
  const macdValues = candles.slice(-signal).map(() => macd)
  const macdSignal = calculateEMAFromValues(macdValues, signal)
  
  return {
    macd,
    macdSignal,
    macdHistogram: macd - macdSignal
  }
}

function calculateBollingerBands(candles, period = 20, multiplier = 2) {
  if (candles.length < period) {
    return { 
      bollingerUpper: 0, 
      bollingerMiddle: 0, 
      bollingerLower: 0,
      bollingerWidth: 0,
      bollingerWidthMA: 0
    }
  }
  
  const closes = candles.slice(-period).map(c => c.close)
  const sma = closes.reduce((sum, price) => sum + price, 0) / period
  
  const variance = closes.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  const stdDev = Math.sqrt(variance)
  
  const bollingerUpper = sma + (stdDev * multiplier)
  const bollingerMiddle = sma
  const bollingerLower = sma - (stdDev * multiplier)
  const bollingerWidth = bollingerUpper - bollingerLower
  
  // 볼린저 밴드 폭의 이동평균 (변동성 기준선)
  const widthValues = candles.slice(-period).map(() => bollingerWidth)
  const bollingerWidthMA = widthValues.reduce((sum, w) => sum + w, 0) / widthValues.length
  
  return {
    bollingerUpper,
    bollingerMiddle,
    bollingerLower,
    bollingerWidth,
    bollingerWidthMA
  }
}

function calculateEMA(candles, period) {
  if (candles.length === 0) return 0
  
  const multiplier = 2 / (period + 1)
  let ema = candles[0].close
  
  for (let i = 1; i < candles.length; i++) {
    ema = (candles[i].close * multiplier) + (ema * (1 - multiplier))
  }
  
  return ema
}

function calculateEMAFromValues(values, period) {
  if (values.length === 0) return 0
  
  const multiplier = 2 / (period + 1)
  let ema = values[0]
  
  for (let i = 1; i < values.length; i++) {
    ema = (values[i] * multiplier) + (ema * (1 - multiplier))
  }
  
  return ema
}

function calculateVolumeMA(candles, period = 20) {
  if (candles.length < period) return 0
  
  const volumes = candles.slice(-period).map(c => c.volume)
  return volumes.reduce((sum, vol) => sum + vol, 0) / period
}

// 모의 시장 데이터 생성 (개발/테스트용)
function generateMockMarketData(symbol) {
  const basePrice = {
    'BTC_KRW': 45000000,
    'ETH_KRW': 2800000,
    'ADA_KRW': 580,
    'DOT_KRW': 8900,
    'MATIC_KRW': 1250
  }[symbol] || 1000
  
  const price = basePrice * (1 + (Math.random() - 0.5) * 0.02) // ±1% 변동
  const volume = Math.random() * 1000000
  
  return {
    candle: {
      open: price * 0.999,
      high: price * 1.001,
      low: price * 0.998,
      close: price,
      volume: volume
    },
    orderbook: {
      bids: Array.from({length: 10}, (_, i) => ({
        price: price * (1 - (i + 1) * 0.001),
        quantity: Math.random() * 100
      })),
      asks: Array.from({length: 10}, (_, i) => ({
        price: price * (1 + (i + 1) * 0.001),
        quantity: Math.random() * 100
      }))
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}