<template>
  <div class="index" style="text-align: center;">
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>专案详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card class="box-card">
      <CaseTable></CaseTable>
    </el-card>
    
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'indexPage',
  created() {
    this.getCaseList()
  },
  methods:{
    ...mapActions('caseM',['getCaseList'])
  }
}
</script>

<style scoped></style>

