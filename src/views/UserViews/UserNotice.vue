<template>
  <div class="commitContainer">
    <CaseStatus></CaseStatus>
    <!-- 审核中表格 -->
    <label>审核中</label>
    <el-table :data="checkingDelay" style="width: 100%" border>
      <el-table-column prop="caseName" label="专案" width="240">
      </el-table-column>
      <el-table-column prop="subName" label="阶段" width="100">
      </el-table-column>
      <el-table-column prop="type" label="延期类型" width="120">
      </el-table-column>
      <el-table-column prop="applyReason" label="延期原因">
      </el-table-column>
      <el-table-column prop="applyDays" label="申请天数" width="80">
      </el-table-column>
      <el-table-column prop="predictTime" label="预计完成时间" width="120">
      </el-table-column>
      <el-table-column label="状态">
        <el-tag type="info">审核中...</el-tag>
      </el-table-column>
    </el-table>
    <br>
    <br>
    <!-- 审核成功表格 -->
    <label>审核成功表</label>
    <el-table :data="passDelay" style="width: 100%" border>
      <el-table-column prop="caseName" label="专案" width="240">
      </el-table-column>
      <el-table-column prop="subName" label="阶段" width="100">
      </el-table-column>
      <el-table-column prop="type" label="延期类型" width="120">
      </el-table-column>
      <el-table-column prop="applyReason" label="延期原因">
      </el-table-column>
      <el-table-column prop="applyDays" label="申请天数" width="80">
      </el-table-column>
      <el-table-column prop="predictTime" label="预计完成时间" width="120">
      </el-table-column>
      <el-table-column label="状态">
        <el-tag type="success">审核通过</el-tag>
      </el-table-column>
    </el-table>
    <br>
    <br>
    <!-- 审核失败表格 -->
    <label>审核失败表</label>
    <el-table :data="failDelay" style="width: 100%" border>
      <el-table-column prop="caseName" label="专案" width="240">
      </el-table-column>
      <el-table-column prop="subName" label="阶段" width="100">
      </el-table-column>
      <el-table-column prop="type" label="延期类型" width="120">
      </el-table-column>
      <el-table-column prop="applyReason" label="延期原因" width="300">
      </el-table-column>
      <el-table-column prop="applyDays" label="申请天数" width="80">
      </el-table-column>
      <el-table-column prop="rejectReason" label="拒绝原因" width="200">
      </el-table-column>
      <el-table-column prop="predictTime" label="预计完成时间" width="120">
      </el-table-column>
      <el-table-column label="状态">
        <el-tag type="danger">审核失败</el-tag>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getDelayByStatus } from '@/api/caseDelayApply'
import { mapState } from 'vuex'
import { formatDate } from '@/utils/common'
export default {
  data() {
    return {
      checkingDelay: [],
      passDelay: [],
      failDelay: []
    }
  },
  computed: {
    ...mapState(['user'])
  },
  created() {
    this.getAllDelay()
  },
  methods: {
    //获取当前用户的所有相关备注
    async getAllDelay() {
      //获取正在审核的
      var res = await getDelayByStatus({ applyId: this.user.id, status: 0 })
      this.checkingDelay = res.data
      this.checkingDelay.map(item=>item.predictTime = formatDate(item.predictTime))

      //获取审核通过的
      res = await getDelayByStatus({ applyId: this.user.id, status: 1 })
      this.passDelay = res.data
      this.passDelay.map(item=>item.predictTime = formatDate(item.predictTime))

      //获取审核失败的
      res = await getDelayByStatus({ applyId: this.user.id, status: 2 })
      this.failDelay = res.data
      this.failDelay.map(item=>item.predictTime = formatDate(item.predictTime))
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