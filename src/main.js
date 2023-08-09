import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import PIMHeader from './components/PIMHeader'
import PIMAside from './components/PIMAside'
import CaseStatus from './components/CaseStatus'
import CaseTable from './components/CaseTable'
import axios from './plugins/axios'

Vue.component("PIMHeader",PIMHeader)
Vue.component("PIMAside",PIMAside)
Vue.component("CaseStatus",CaseStatus)
Vue.component("CaseTable",CaseTable)

Vue.prototype.$axios = axios
Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
