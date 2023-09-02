<template>
  <div class="index" style="text-align: center;">
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
        <el-breadcrumb-item>专案管理</el-breadcrumb-item>
        <el-breadcrumb-item>home</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card class="box-card">
      <CaseTable></CaseTable>
    </el-card>
    
  </div>
</template>

<script>
import CasePie from '../components/CasePie'
import { formatDate, getStatus } from '@/utils/common'
import { mapState } from 'vuex'
export default {
  name: 'indexPage',
  created() {
    this.$store.dispatch('caseM/getCaseList')
  },
}
</script>

<style scoped></style>

