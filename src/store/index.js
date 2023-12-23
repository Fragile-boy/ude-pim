import Vue from 'vue'
import Vuex from 'vuex'
import caseM from '@/store/modules/caseM'
import log from './modules/log'
import apply from './modules/apply'
import { getInfo, setInfo } from '@/utils/storage'
import { updateUser } from '@/api/user'

Vue.use(Vuex)

export default new Vuex.Store({
  // // //开启严格模式
  // strict: true,
  state: {
    user:getInfo(),
  },
  getters: {
    getType(state){
      return state.user.type
    }
  },
  mutations: {
    setUser(state,newObj){
      state.user = newObj
      setInfo(newObj)
    }
  },
  actions: {
    fetchUserData({ commit }, userData) {
      // 假设 userData 已经是取得的用户数据
      commit('setUser', userData);
    },
    async editUserInfo(ctx,userDate){
      const res = await updateUser(userDate)
      if(res.code===200){
        ctx.commit('setUser',userDate)
      }
      return res
    }
  },  
  modules: {
    caseM,
    log,
    apply,
  }
})
