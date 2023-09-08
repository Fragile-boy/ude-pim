import Vue from 'vue'
import VueRouter from 'vue-router'

import IndexView from '../views/IndexView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFind from '@/views/NotFind.vue'
import CaseSubView from '@/views/CaseSubView.vue'
import CasePersonView from '@/views/CaseViews/CasePersonView.vue'
import UserView from '@/views/UserViews/UserView.vue'
import UserNotice from '@/views/UserViews/UserNotice.vue'
import User4Case from '@/views/UserViews/User4Case.vue'
import UserChart from '@/views/UserViews/UserChart.vue'
import SubForm from '@/views/SubForm.vue'
import CheckIndex from '@/views/CheckViews/CheckIndex'
import checkCommit from '@/views/CheckViews/checkCommit'
import checkException from '@/views/CheckViews/checkException'
import checkDelay from '@/views/CheckViews/checkDelay'
import checkFinish from '@/views/CheckViews/checkFinish'
import checkStudy from '@/views/CheckViews/checkStudy'
import checkApply from '@/views/CheckViews/checkApply'
//延期表单界面
import DelayView from '@/views/DelayView'
//专案列表界面
import CaseList from '@/views/CaseViews/CaseList'
//子流程管理界面
import subManage from '@/views/CaseViews/subManage'
//模板管理界面
import TempleteManage from '@/views/CaseViews/TempleteManage'
//部员列表界面
import UserList from '@/views/UserViews/UserList'
import caseData from '@/views/dataViews/caseData'
import store from '@/store'
import { getInfo } from '@/utils/storage'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  //home
  {
    path: '/home',
    component: HomeView,
    redirect: '/index',
    children: [
      //主页
      {
        path: '/index',
        name: 'index',
        component: IndexView
      },
      // 子流程详情页
      {
        path: '/case2sub',
        name: 'case-sub',
        component: CaseSubView
      },
      // 按个人分的子流程详情页
      {
        path: '/case2person',
        name: 'case-person',
        component: CasePersonView
      },
      // 专案列表
      {
        path:'/caseList',
        name:'caseList',
        component:CaseList
      },
      //子流程管理
      {
        path:'/subManage',
        name:'subManage',
        component:subManage
      },
      //模板管理
      {
        path:'/templeteManage',
        name:'templeteManage',
        component:TempleteManage
      },
      //部员列表
      {
        path:'/userList',
        name:'userList',
        component:UserList
      },
      // 异常状态的专案子阶段
      {
        path:'/exception',
        name:'/exception',
        component:checkException
      },
      //延期申请
      {
        path: '/delay',
        name: 'delay',
        component: checkDelay
      },
      // 完结申请 
      {
        path: '/finish',
        name: 'finish',
        component: checkFinish
      },
      // 技术研究申请 
      {
        path: '/study',
        name: 'study',
        component: checkStudy
      },
      // 专案类申请 
      {
        path: '/caseApply',
        name: 'caseApply',
        component: checkApply
      },
      //专案分析
      {
        path: '/caseAnalysis',
        name: 'caseAnalysis',
        component: caseData
      },
      {
        // 信息中心页
        path: '/user/index',
        name: 'userNotice',
        component: UserNotice
      },
      {
        // 子流程进度页
        path: '/user/progress',
        name: 'user4case',
        component: User4Case
      },
    ]
  },
  // 个人管理页
  {
    path: '/user',
    name: 'user',
    component: UserView,
    redirect: '/user/1',
    children: [
      
      
      {
        // 工作总览表格页
        path: '/user/3',
        name: 'userchart',
        component: UserChart
      },
    ]
  },
  // 登录页
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  // 子流程评论表单页
  {
    path: '/subForm',
    name: 'subForm',
    component: SubForm
  },
  //审批管理页
  {
    path: '/check',
    name: "check",
    component: CheckIndex,
    redirect: '/commit',
    children: [
      {
        path: '/commit',
        name: 'commit',
        component: checkCommit
      },
    ]
  },
  //阶段申请延期页
  {
    path: '/delayApply',
    name: 'delayApple',
    component: DelayView
  },
  {
    path: '*',
    component: NotFind
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

//管理员权限界面
// const authUrls = ['/check', '/commit', '/delay', '/finish']


router.beforeEach(async (to, from, next) => {
  // if (authUrls.includes(to.path)) {
  //   await store.dispatch('fetchUserData', getInfo())
  //   if (store.state.user.type !== 1) {
  //     next("/home")
  //     return
  //   }
  // }
  next()
})

export default router
