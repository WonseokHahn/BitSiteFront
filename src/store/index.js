import { createStore } from 'vuex'
import authModule from './modules/auth'
import newsModule from './modules/news'

export default createStore({
  modules: {
    auth: authModule,
    news: newsModule
  },
  
  state: {
    loading: false,
    error: null
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  },
  
  getters: {
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    error: state => state.error
  }
})