import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/note',
    name: 'note',
    component: function () {
      return import( '../views/NotePad.vue')
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
