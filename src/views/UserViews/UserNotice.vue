<template>
  <div class="commitContainer">
    <!-- 审核中表格 -->
    <label>审核中</label>
    <el-table :data="checkingCommit" style="width: 100%" border>
      <el-table-column prop="caseName" label="专案" width="180">
      </el-table-column>
      <el-table-column prop="subName" label="阶段" width="180">
      </el-table-column>
      <el-table-column prop="content" label="备注信息">
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <el-tag type="info">审核中</el-tag>
      </el-table-column>
    </el-table>
    <br>
    <br>
    <!-- 审核成功表格 -->
    <label>审核成功表</label>
    <el-table :data="passCommit" style="width: 100%" border>
      <el-table-column prop="caseName" label="专案" width="180">
      </el-table-column>
      <el-table-column prop="subName" label="阶段" width="180">
      </el-table-column>
      <el-table-column prop="content" label="备注信息">
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <el-tag type="success">审核通过</el-tag>
      </el-table-column>
    </el-table>
    <br>
    <br>
    <!-- 审核失败表格 -->
    <label>审核失败表</label>
    <el-table :data="failCommit" style="width: 100%" border>
      <el-table-column prop="caseName" label="专案" width="180">
      </el-table-column>
      <el-table-column prop="subName" label="阶段" width="180">
      </el-table-column>
      <el-table-column prop="content" label="备注信息" width="230">
      </el-table-column>
      <el-table-column prop="reason" label="失败原因" width="230">
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <el-tag type="danger">审核不通过</el-tag>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getCommitByStatus } from '@/api/caseSubCommit'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      checkingCommit: [],
      passCommit: [],
      failCommit: []
    }
  },
  computed: {
    ...mapState(['user'])
  },
  created() {
    this.getAllCommit()
  },
  methods: {
    //获取当前用户的所有相关备注
    async getAllCommit() {
      //获取正在审核的
      var res = await getCommitByStatus({ createUser: this.user.id, status: 0 })
      this.checkingCommit = res.data

      //获取审核通过的
      res = await getCommitByStatus({ createUser: this.user.id, status: 1 })
      this.passCommit = res.data

      //获取审核失败的
      res = await getCommitByStatus({ createUser: this.user.id, status: 2 })
      this.failCommit = res.data
    }
  },
  //根据数字获取状态
  number2status(status) {
    if (status === 0)
      return "审核中"
    else if (status === 1)
      return "已通过"
    else if (status === 2)
      return "审核失败"
  }
}
</script>

<style scoped></style>