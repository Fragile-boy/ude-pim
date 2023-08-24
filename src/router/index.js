import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFind from '@/views/NotFind.vue'
import CaseSubView from '@/views/CaseSubView.vue'
import UserView from '@/views/UserViews/UserView.vue'
import UserNotice from '@/views/UserViews/UserNotice.vue'
import User4Case from '@/views/UserViews/User4Case.vue'
import UserChart from '@/views/UserViews/UserChart.vue'
import SubForm from '@/views/SubForm.vue'
import CheckIndex from '@/views/CheckViews/CheckIndex'
import checkCommit from '@/views/CheckViews/checkCommit'
import checkDelay from '@/views/CheckViews/checkDelay'
import DelayView from '@/views/DelayView'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  //主页
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  // 子流程详情页
  {
    path: '/case2sub',
    name: 'case-sub',
    component: CaseSubView
  },
  // 个人管理页
  {
    path: '/user',
    name: 'user',
    component: UserView,
    redirect: '/user/1',
    children: [
      {
        // 信息中心页
        path: '/user/1',
        name: 'userNotice',
        component: UserNotice
      },
      {
        // 子流程进度页
        path: '/user/2',
        name: 'user4case',
        component: User4Case
      },
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
      }, {
        path: '/delay',
        name: 'delay',
        component: checkDelay
      }
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

export default router
