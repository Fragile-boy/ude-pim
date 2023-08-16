<template>
  <div id="app">
    <PIMAside></PIMAside>
    <keep-alive :include="['homePage']">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>


<script>
import { mapMutations } from 'vuex'
  export default{
    mounted(){
      if(localStorage.getItem("user")!==null){
        var user = JSON.parse(localStorage.getItem("user"))
        console.log("正在设置名称")
        this.setUser(user)
      }
    },
    methods:{
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
  position: relative;
}

/* nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
} */
</style>
