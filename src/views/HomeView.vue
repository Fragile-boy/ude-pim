<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <img src="@/assets/logo.png" alt="">
      <span>新技研进度管理系统</span>
      <el-button>退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <PIMAside :isCollapse="isCollapse"></PIMAside>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return{
      isCollapse:false
    }
  },
  methods:{
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: white;
  font-size: 30px;
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button{
  background-color: #4a5064;
  color: white;
  font-size: 20px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor:pointer;
}
</style>