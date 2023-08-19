<template>
  <div id="app">
    <!-- 侧边栏 -->
    <PIMAside class="nav"></PIMAside>

    <router-view></router-view>

  </div>
</template>


<script>
import { mapMutations } from 'vuex'
export default {
  created() {
    if (localStorage.getItem("user") !== null) {
      var user = JSON.parse(localStorage.getItem("user"))
      console.log("正在设置名称")
      this.setUser(user)
    }
  },
  methods: {
    ...mapMutations(['setUser'])
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  display: flex;
}
</style>
