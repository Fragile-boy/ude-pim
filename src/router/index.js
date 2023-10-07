import Vue from 'vue'
import VueRouter from 'vue-router'


// 主页设计
import HomeView from '../views/HomeView.vue'

// 登录界面
import LoginView from '../views/LoginView.vue'

// 404未找到界面
import NotFind from '@/views/NotFind.vue'


// 专案管理界面

import IndexView from '../views/IndexView.vue'
import CasePersonView from '@/views/CaseViews/CasePersonView.vue'
import CaseSubView from '@/views/CaseSubView.vue'
//专案列表界面
import CaseList from '@/views/CaseViews/CaseList'
//子流程管理界面
import subManage from '@/views/CaseViews/subManage'
//模板管理界面
import TempleteManage from '@/views/CaseViews/TempleteManage'
//任务管理界面
import TaskManage from '@/views/CaseViews/TaskManage'


// 审批流程界面
import checkException from '@/views/CheckViews/checkException'
import checkDelay from '@/views/CheckViews/checkDelay'
import checkFinish from '@/views/CheckViews/checkFinish'
import checkStudy from '@/views/CheckViews/checkStudy'
import checkApply from '@/views/CheckViews/checkApply'

// 数据统计界面
import caseData from '@/views/dataViews/caseData'

//部员管理界面
import UserList from '@/views/ManageViews/UserList'
import UserProjectManagement from '@/views/ManageViews/UserProjectManagement'
import UserProjectTracking from '@/views/ManageViews/UserProjectTracking'


// 个人中心界面
import UserIndex from '@/views/UserViews/UserIndex.vue'
import User4Case from '@/views/UserViews/User4Case.vue'
import UserStatistics from '@/views/UserViews/UserStatistics.vue'
import UserChart from '@/views/UserViews/UserChart.vue'
import UserInfo from '@/views/UserViews/UserInfo.vue'

// 需求界面
import Demand from '@/components/Demand.vue'

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
        path: '/caseList',
        name: 'caseList',
        component: CaseList
      },
      //子流程管理
      {
        path: '/subManage',
        name: 'subManage',
        component: subManage
      },
      //模板管理
      {
        path: '/templeteManage',
        name: 'templeteManage',
        component: TempleteManage
      },
      //任务管理
      {
        path: '/taskManage',
        name: 'taskManage',
        component: TaskManage
      },

      // 异常状态的专案子阶段
      {
        path: '/exception',
        name: 'exception',
        component: checkException
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


      //部员列表
      {
        path: '/userList',
        name: 'userList',
        component: UserList
      },
      {
        // 部员专案管理页
        path: '/userProject',
        name: 'userProjectManagement',
        component: UserProjectManagement
      },
      {
        // 部员专案追踪页
        path: '/userProjectTracking',
        name: 'userProjectTracking',
        component: UserProjectTracking
      },

      {
        // 个人总览页
        path: '/user/index',
        name: 'userIndex',
        component: UserIndex
      },
      {
        // 个人总览页
        path: '/user/info',
        name: 'userInfo',
        component: UserInfo
      },
      {
        // 执行任务页
        path: '/user/progress',
        name: 'user4case',
        component: User4Case
      },
      {
        // 数据统计页
        path: '/user/statistics',
        name: 'userStatistics',
        component: UserStatistics
      },
      {
        // 图表统计页
        path: '/user/chart',
        name: 'userChart',
        component: UserChart
      },
      {
        //需求
        path: '/demand',
        name: 'demand',
        component: Demand
      }
    ]
  },
  // 登录页
  {
    path: '/login',
    name: 'login',
    component: LoginView
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
const authUrls = ['/caseList', '/subManage'
  , '/templeteManage', '/taskManage', '/exception', '/delay', '/finish', '/study'
  , '/caseApply', '/caseAnalysis', '/userList', '/userProject', '/userProjectTracking']

//用户界面
const userUrls = ['/user/index', '/user/info', '/user/progress', '/user/statistics', '/user/chart']


router.beforeEach(async (to, from, next) => {
  //检查权限界面
  if (authUrls.includes(to.path)) {
    await store.dispatch('fetchUserData', getInfo())
    if (store.state.user.type !== 1) {
      next("/index")
      return
    }
  }
  //检查用户界面
  if (userUrls.includes(to.path)) {
    await store.dispatch('fetchUserData', getInfo())
    if (store.state.user.status > 2) {
      next("/index")
      return
    }
  }
  next()
})

export default router
