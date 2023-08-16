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


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/case2sub',
    name: 'case-sub',
    component: CaseSubView
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
    children: [
      {
        path: '/user/1',
        name: 'userNotice',
        component: UserNotice
      },
      {
        path: '/user/2',
        name: 'user4case',
        component: User4Case
      },
      {
        path: '/user/3',
        name: 'userchart',
        component: UserChart
      },
    ]
  },
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

export default router
