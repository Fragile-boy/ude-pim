<template>
  <div>
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>专案数据分析</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-card>
      <!-- 查询区域 -->
      <el-row :gutter="10">
        <el-col :span="2">
          <el-select v-model="year" :placeholder="defaultYear[0] + ''">
            <el-option v-for="item in defaultYear" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-col>

        <el-col :span="2">
          <el-select v-model="month" placeholder="请选择要查询的月份">
            <el-option v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-col>

        <el-col :span="2">
          <el-button type="primary" @click="getFinishSubList" round>查询</el-button>
        </el-col>

        <el-col :span="4" :offset="14">
          <el-button type="warning" round v-if="showSubList.length !== finishSubList.length"
            @click="showSubList = finishSubList">显示所有</el-button>
          <el-button type="warning" round v-else @click="showPart()">部分显示</el-button>
          <el-tooltip class="item" effect="dark" content="设定达成率上界" placement="top">
            <el-button icon="el-icon-setting" type="primary" round @click="changeTopRate"></el-button>
          </el-tooltip>
        </el-col>
      </el-row>

      <br>

      <!-- 显示统计信息 -->
      <div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic :value="statisticsObj.planFinishCount" title="本月计划完成"></el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic :value="statisticsObj.finishCount" title="本月实际完成"></el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic :value="statisticsObj.highAchievingCount" :title="`达成率高于${showTopRate}`"></el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic :precision="2" suffix="%" :value="statisticsObj.highAchievingRate" title="优达率"></el-statistic>
          </el-col>
        </el-row>
      </div>

      <br>

      <el-table :data="showSubList" style="width: 100%" :cell-style="setCellColor">
        <el-table-column prop="caseName" label="专案">
        </el-table-column>
        <el-table-column prop="subName" label="阶段">
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间">
        </el-table-column>
        <el-table-column prop="finishTime" label="结束时间">
        </el-table-column>
        <el-table-column prop="planDays" label="计划天数">
        </el-table-column>
        <el-table-column prop="executionDays" label="执行天数">
        </el-table-column>
        <el-table-column label="达成率">
          <template slot-scope="scope">
            {{ scope.row.achievingRate.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-info" size="mini" @click="openComment(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>


    <!-- 显示备注框 -->
    <el-dialog title="备注信息" :visible.sync="commentVisible" width="40%">
      <el-form ref="commitFormRef" label-width="100px">
        <el-form-item label="专案">
          <el-input v-model="commentObj.caseName" disabled></el-input>
        </el-form-item>
        <!-- 子流程名称显示 -->
        <el-form-item label="阶段">
          <el-input v-model="commentObj.subName" disabled></el-input>
        </el-form-item>
        <!-- 备注显示区域 -->
        <el-form-item label="备注信息">
          <el-card class="box-card">
            <div v-for="o in commentObj.comments" :key="o" class="text item">
              {{ o }}
            </div>
            <label v-if="commentObj.comments.length === 0">暂无备注</label>
          </el-card>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="commentVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  
<script>
import { mapState } from 'vuex';
import { analysis, planFinishCount } from '@/api/caseSub'
import { timeSub } from '@/utils/common';
import { getById } from '@/api/caseSubCommit';

export default {
  data() {
    return {
      //所有落在特定月份的数据
      finishSubList: [],
      // 要显示的（一般仅显示达成率低于0.7的）
      showSubList: [],
      defaultYear: this.initYear(),
      year: '',
      //要查询的月份
      // month: this.getDefaultMonth(),
      month: 7,
      title: "达成率",
      value: 123.78,
      //评论对象
      commentObj: {
        comments: []
      },
      commentVisible: false,
      //最高上限显示
      showTopRate: 0.7,
      statisticsObj: {
        planFinishCount: 0,
        finishCount: 0,
        highAchievingCount: 0,
        highAchievingRate: 0
      }
    }
  },
  created() {
    this.getFinishSubList()
  },
  methods: {
    async getFinishSubList() {
      if (this.year === '')
        this.year = this.defaultYear[0]
      var res = await planFinishCount({ year: this.year, month: this.month })
      if (res.code === 200) {
        this.statisticsObj.planFinishCount = res.data
      } else {
        this.$message.error(res.msg)
      }
      res = await analysis({ year: this.year, month: this.month })
      if (res.code === 200) {
        this.finishSubList = res.data
        this.showSubList = []
        this.finishSubList.forEach(item => {
          item.executionDays = timeSub(item.startTime, item.finishTime)
          item.executionDays -= item.unforcedDays === null ? 0 : item.unforcedDays
          if (item.achievingRate < this.showTopRate)
            this.showSubList.push(item)
        })
        this.statisticsObj.finishCount = this.finishSubList.length
        this.statisticsObj.highAchievingCount = this.statisticsObj.finishCount - this.showSubList.length
        this.statisticsObj.highAchievingRate = (this.statisticsObj.highAchievingCount * 100.0) / this.statisticsObj.finishCount
      } else {
        this.$message.error(res.msg)
      }
    },
    getDefaultMonth() {
      const today = new Date()
      return today.getMonth() + 1;
    },
    //生成默认年份
    initYear() {
      var defaultYear = []
      const today = new Date()
      var curYear = today.getFullYear()
      while (curYear >= 2018) {
        defaultYear.push(+curYear)
        curYear--
      }
      return defaultYear
    },
    setCellColor({ row, column, rowIndex, columnIndex }) {
      if (row.achievingRate >= 0.7)
        return 'background-color:#ABEFBA'
      else if (row.achievingRate >= 0.4)
        return 'background-color:#EFEAAB'
      else
        return 'background-color:#F1B9CB'
    },
    //打开评论
    async openComment(row) {
      this.commentVisible = true
      this.commentObj.caseName = row.caseName
      this.commentObj.subName = row.subName
      // 获取专案子流程对应的所有备注
      var res = await getById(row.id)
      this.commentObj.comments = []
      if (res.code === 200) {
        res.data.forEach(item => this.commentObj.comments.push(item.content))
      }
    },
    //只显示专案
    showPart() {
      this.showSubList = []
      this.finishSubList.forEach(item => {
        if (item.achievingRate < this.showTopRate)
          this.showSubList.push(item)
      })
      this.statisticsObj.highAchievingCount = this.statisticsObj.finishCount - this.showSubList.length
      this.statisticsObj.highAchievingRate = (this.statisticsObj.highAchievingCount * 100.0) / this.statisticsObj.finishCount
    },
    //修改达成率上界，低于此上界才显示
    changeTopRate() {
      this.$prompt('请输入达成率上界，低于此达成率的阶段才显示', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^0.\d+/,
        inputErrorMessage: '达成率必须是0-1之间的小数'
      }).then(({ value }) => {
        this.showTopRate = value
        this.$message({
          type: 'success',
          message: '当前达成率上界是: ' + value
        });
        this.showPart()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        });
      });
    }
  }
};
</script>

<style lang="less" scoped></style>