import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import PIMHeader from './components/PIMHeader'
import PIMAside from './components/PIMAside'
import CasePie from './components/CasePie'
import CaseStatus from './components/CaseStatus'
import CaseTable from './components/CaseTable'
import CaseSubTable from './components/CaseSubTable'
import UserCase from './components/UserCase'
import CaseBox from './components/CaseBox'
import SubForm from './views/SubForm'
import axios from './plugins/service'
import router from './router'
import * as echarts from 'echarts';
import store from './store'
import '@/css/global.css'

Vue.component("PIMHeader",PIMHeader)
Vue.component("PIMAside",PIMAside)
Vue.component("CaseStatus",CaseStatus)
Vue.component("CaseTable",CaseTable)
Vue.component("CaseSubTable",CaseSubTable)
Vue.component("UserCase",UserCase)
Vue.component("CaseBox",CaseBox)
Vue.component("CasePie",CasePie)
Vue.component("SubForm",SubForm)


Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts;
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
