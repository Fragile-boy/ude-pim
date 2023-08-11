import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import PIMHeader from './components/PIMHeader'
import PIMAside from './components/PIMAside'
import CaseStatus from './components/CaseStatus'
import CaseTable from './components/CaseTable'
import CaseSubTable from './components/CaseSubTable'
import axios from './plugins/axios'
import router from './router'
import * as echarts from 'echarts';

Vue.component("PIMHeader",PIMHeader)
Vue.component("PIMAside",PIMAside)
Vue.component("CaseStatus",CaseStatus)
Vue.component("CaseTable",CaseTable)
Vue.component("CaseSubTable",CaseSubTable)

Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts;
Vue.config.productionTip = false

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
