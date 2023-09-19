<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <img src="@/assets/logo.png" alt="">
      <span>新技研进度管理系统</span>
      <el-button @click="logout">{{ user.name }}<i class="el-icon-switch-button
"></i></el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <PIMAside :isCollapse="isCollapse"></PIMAside>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <keep-alive :include="['indexPage','userStatistics','caseTracking']">
          <router-view></router-view>
        </keep-alive>

      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { logout } from '@/api/login'
export default {
  data() {
    return {
      isCollapse: false
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    ...mapMutations(['setUser']),
    async logout() {
      this.setUser({})
      // if(localStorage.getItem("user")===null)
      //     return
      await logout()
      this.$message.success({
        message: "登出成功",
        duration: 1000
      })
      this.$router.push('/login')

    }
  }
}
</script>

<style lang="less" scoped>

.home-container {
  height: 100%;
}

.el-header {
  height: 10% !important;
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: white;
  font-size: 35px;
}

.el-aside {
  background-color: #333744;
  display: inline-block; //将右侧内联元素变成块级，滚动条出现在下拉列表上
  overflow: hidden; //隐藏滚动条
}

.el-main {
  background-color: #eaedf1;
}

.toggle-button {
  background-color: #4a5064;
  color: white;
  font-size: 20px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>