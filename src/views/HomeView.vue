<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>


      <img src="@/assets/logo_mini.png" alt="">

      <!-- <span style="color:red">(开发测试中...请稍后访问)</span> -->
      <span>新技研进度管理系统<span style="font-size: 10px;">(测试版)</span></span>
      
      <el-button round size="medium" @click="handleLogout()">
        {{ user === null ? '' : user.name }}
        <i class="el-icon-switch-button"></i>
      </el-button>


    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '55px' : '200px'" v-if="user.status <= 2" style="margin-left: -10px;">
        <div class="toggle-button" @click="toggleCollapse">
          <i class="el-icon-back" v-if="!isCollapse"></i>
          <i class="el-icon-right" v-else style="margin-left: 10px;"></i>
        </div>
        <PIMAside :isCollapse="isCollapse"></PIMAside>
      </el-aside>
      <!-- 右侧内容区域 -->
      <el-main>
        <div style="margin-bottom: 10px; margin-top: -10px;">
          <NavigationBar></NavigationBar>
        </div>
        <keep-alive :include="['indexPage', 'userStatistics', 'caseTracking', 'checkException', 'caseAnalysis','caseManage']">
          <router-view></router-view>
        </keep-alive>

      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { logout, checkLogin } from '@/api/login'
import NavigationBar from '@/components/NavigationBar.vue'
export default {
  components: { NavigationBar },
  data() {
    return {
      isCollapse: false,
    }
  },
  created() {
    
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    ...mapMutations(['setUser']),
    async handleLogout() {
      this.setUser({})
      localStorage.removeItem("token")
      await logout()
      this.$message.success({
        message: "登出成功",
        duration: 1000
      })
      // this.$router.push('/login')
    },
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  height: 6% !important;
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