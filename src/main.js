import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import PIMHeader from './components/PIMHeader'
import PIMAside from './components/PIMAside'
import NavigationBar from './components/NavigationBar'
import CasePie from './components/CasePie'
import CaseStatus from './components/CaseStatus'
import CaseTable from './components/CaseTable'
import CaseSubTable from './components/CaseSubTable'
import CaseBox from './components/CaseBox'
import axios from './plugins/service'
import router from './router'
import * as echarts from 'echarts';
import store from './store'
import '@/css/global.css'
// markdown编辑组件导入
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

import Prism from 'prismjs';

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
});

Vue.use(VueMarkdownEditor);

// markdown预览组件引入
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

Vue.use(VMdPreview);


Vue.component("PIMHeader",PIMHeader)
Vue.component("PIMAside",PIMAside)
Vue.component("CaseStatus",CaseStatus)
Vue.component("CaseTable",CaseTable)
Vue.component("CaseSubTable",CaseSubTable)
Vue.component("CaseBox",CaseBox)
Vue.component("CasePie",CasePie)
Vue.component("NavigationBar",NavigationBar)

Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts;
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
