import Vue from 'vue'
import Vuex from 'vuex'
import caseM from '@/store/modules/caseM'

Vue.use(Vuex)

export default new Vuex.Store({
  // //开启严格模式
  // strict: true,
  state: {
    user:{}
  },
  getters: {
  },
  mutations: {
    setUser(state,newObj){
      state.user = newObj
    }
  },
  actions: {
  },
  modules: {
    caseM
  }
})
