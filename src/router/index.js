import Vue from 'vue'
import VueRouter from 'vue-router'
import { Message } from 'element-ui'


// 主页设计
import HomeView from '../views/HomeView.vue'

// 登录界面
import LoginView from '../views/LoginView.vue'

// 404未找到界面
import NotFind from '@/views/NotFind.vue'
// 禁止访问界面
import NoAccess from '@/views/NoAccess.vue'


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
import monthlyAnalysis from '@/views/dataViews/monthlyAnalysis'
import caseAnalysis from '@/views/dataViews/caseAnalysis'

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

// 待办事项
import TodoView from '@/components/TodoView.vue'

// 测试界面
import test from '@/components/TestFunction.vue'

import store from '@/store'
import { getInfo } from '@/utils/storage'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/common/index'
  },
  //公共界面
  {
    path: '/common',
    component: HomeView,
    redirect: 'index',
    children: [
      //主页
      {
        path: 'index',
        name: '主页',
        component: IndexView
      },
      // 子流程详情页
      {
        path: 'case2sub',
        name: '子流程详情',
        component: CaseSubView
      },
      // 按个人分的子流程详情页
      {
        path: 'case2person',
        name: '专案个人详情',
        component: CasePersonView
      },

      // 专案分析
      {
        path: 'caseAnalysis',
        name: '专案分析',
        component: caseAnalysis
      },

      {
        // 部员专案管理页
        path: 'userProject',
        name: '部员专案统计',
        component: UserProjectManagement
      },
      {
        // 部员专案追踪页
        path: 'userProjectTracking',
        name: '部员专案追踪',
        component: UserProjectTracking
      },
      {
        //需求
        path: 'demand',
        name: '需求管理',
        component: Demand
      },
      //待办事项
      {
        path: 'schedule',
        name: '待办事项',
        component: TodoView
      }
    ]
  },
  // 管理员界面
  {
    path: '/admin',
    component: HomeView,
    children: [
      // 专案列表
      {
        path: 'caseList',
        name: '专案列表',
        component: CaseList
      },
      //子流程管理
      {
        path: 'subManage',
        name: '子流程管理',
        component: subManage
      },
      //模板管理
      {
        path: 'templeteManage',
        name: '模板管理',
        component: TempleteManage
      },
      //任务管理
      {
        path: 'taskManage',
        name: '任务管理',
        component: TaskManage
      },

      // 异常状态的专案子阶段
      {
        path: 'exception',
        name: '异常专案处理',
        component: checkException
      },
      //延期申请
      {
        path: 'delay',
        name: '延期申请',
        component: checkDelay
      },
      // 完结申请 
      {
        path: 'finish',
        name: '完结申请',
        component: checkFinish
      },
      // 技术研究申请 
      {
        path: 'study',
        name: '任务申请',
        component: checkStudy
      },
      // 专案类申请 
      {
        path: 'caseApply',
        name: '专案类申请',
        component: checkApply
      },
      {
        // 消息中心页
        path: 'info',
        name: '消息中心',
        component: UserInfo
      },

      //月报分析
      {
        path: 'monthlyAnalysis',
        name: '月报分析',
        component: monthlyAnalysis
      },
      //部员列表
      {
        path: 'userList',
        name: '部员信息管理',
        component: UserList
      },
    ]
  },
  // 普通用户界面
  {
    path: '/user',
    redirect: 'index',
    component: HomeView,
    children: [
      {
        // 个人总览页
        path: 'index',
        name: '个人总览',
        component: UserIndex
      },
      {
        // 消息中心页
        path: 'info',
        name: '消息中心',
        component: UserInfo
      },
      {
        // 执行任务页
        path: 'progress',
        name: '执行任务',
        component: User4Case
      },
      {
        // 数据统计页
        path: 'statistics',
        name: '数据统计',
        component: UserStatistics
      },
      {
        // 图表统计页
        path: 'chart',
        name: '图表统计',
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
  {
    path: '/noaccess',
    name: '禁止访问',
    component: NoAccess
  },
  {
    path: '/test',
    component: test
  },
  {
    path: '*',
    component: NotFind
  }
]

const router = new VueRouter({
  // mode: 'history',
  base:'/ude-pim',
  routes
})

//管理员权限界面
const authUrls = ['/caseList', '/subManage'
  , '/templeteManage', '/taskManage', '/delay', '/finish', '/study'
  , '/caseApply', '/userList']

//用户界面
const userUrls = ['/user/index', '/user/info', '/user/progress', '/user/statistics', '/user/chart', '/userProjectTracking', '/exception', '/caseAnalysis', '/userProject']

// 禁止访问界面
// '/caseList'
const forbiddenUrls = []


router.beforeEach(async (to, from, next) => {
  if (to.path === '/login') {
    next()
    return
  }
  var user = localStorage.getItem('ude_pim_user')
  //检查是否登录
  if (user === null || user === "{}") {
    next('/login')
    return
  }

  user = JSON.parse(user)

  // 检查禁止访问，正在开发的界面
  if (forbiddenUrls.includes(to.path)) {
    if (user.name !== 'admin') {
      next('/noaccess')
      return
    }
  }

  //检查权限界面
  if (to.path.includes('admin')) {
    if (user.type !== 1) {
      Message({
        message: '你无权访问管理员界面',
        type: 'error' // 可以是 'success', 'warning', 'info', 'error' 中的一个
      });
      return
    }
  }
  //检查用户界面
  if (to.path.includes('user')) {
    
    // await store.dispatch('fetchUserData', getInfo())
    if (user.status > 2) {
      Message({
        message: '你无权访问用户界面,正跳转回主页',
        type: 'error' // 可以是 'success', 'warning', 'info', 'error' 中的一个
      });
      next("/common/index")
      return
    }
  }
  next()
})

export default router
