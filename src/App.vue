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
