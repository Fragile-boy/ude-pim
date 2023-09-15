<template>
  <div>
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card>

    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  data(){
    return{
      showList:[],
      allTaskList:[]
    }
  },
  created(){
    this.getTaskList();
  },
  computed:{
    ...mapState(['user'])
  },
  methods:{
    async getFinishedTaskList(){
      const res = await getFinishedTaskList(this.user.id)
    }
  }
}
</script>

<style></style>