import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFind from '@/views/NotFind.vue'
import CaseSubView from '@/views/CaseSubView.vue'
import UserView from '@/views/UserView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/home'
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path:'/case2sub',
    name:'case-sub',
    component:CaseSubView
  },
  {
    path:'/user',
    name:'user',
    component:UserView
  },
  {
    path:'/login',
    name:'login',
    component:LoginView
  },
  {
    path:'*',
    component:NotFind
  }
]

const router = new VueRouter({
  mode:'history',
  routes
})

export default router
