<template>
  <div>
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
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

        <el-col :span="1">
          <el-button type="primary" icon="el-icon-top" round @click="changeMonth(-1)"></el-button>
        </el-col>

        <el-col :span="1">
          <el-button type="primary" icon="el-icon-bottom" round @click="changeMonth(1)"></el-button>
        </el-col>

        <el-col :span="2">
          <el-button type="primary" @click="updateView()" round>查询</el-button>
        </el-col>

        <el-col :span="4" :offset="12">
          <el-button type="warning" round v-if="showSubList.length !== finishSubList.length"
            @click="showSubList = finishSubList">显示所有</el-button>
          <el-button type="warning" round v-else @click="showPart()">部分显示</el-button>
          <el-tooltip class="item" effect="dark" content="设定达成率上界" placement="top">
            <el-button icon="el-icon-top" type="success" round @click="changeTopRate"></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="不良阈值下限" placement="top">
            <el-button icon="el-icon-bottom" type="danger" round @click="changeBottomRate"></el-button>
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
        <!-- 显示图表信息 -->
        <div id="charts-area" style="width:100%;height: 300px;"></div>
      </div>

      <br>

      <el-table :data="showSubList" style="width: 100%;font-size:15px;" :cell-style="setCellColor"
        @cell-dblclick="showDelayReason">
        <el-table-column prop="caseName" width="260" label="专案">
        </el-table-column>
        <el-table-column prop="subName" label="阶段">
        </el-table-column>
        <el-table-column prop="chargeName" label="负责人" width="213">
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间">
        </el-table-column>
        <el-table-column prop="finishTime" label="结束时间">
        </el-table-column>
        <el-table-column prop="planDays" label="计划天数">
        </el-table-column>
        <el-table-column prop="executionDays" label="执行天数">
        </el-table-column>
        <el-table-column prop="unforcedDays" label="外界延期">
        </el-table-column>
        <el-table-column prop="applyDelay" label="人为延期">
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

    <!-- 显示外界因素延期 -->
    <el-drawer :visible.sync="delayDrawer" :direction="direction" size="50%">
      <el-table :data="delayList" style="width: 100%" border>
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
      </el-table>
    </el-drawer>
  </div>
</template>
  
<script>
import { mapState } from 'vuex';
import { analysis, planFinishCount } from '@/api/caseSub'
import { formatDate, timeSub } from '@/utils/common';
import { getById } from '@/api/caseSubCommit';
import { getDelayByStatus } from '@/api/caseDelayApply';

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
      month: this.getDefaultMonth(),
      title: "达成率",
      value: 123.78,
      //评论对象
      commentObj: {
        comments: []
      },
      commentVisible: false,
      //最高上限显示
      showTopRate: 0.7,
      showBottomRate: 0.4,
      statisticsObj: {
        planFinishCount: 0,
        finishCount: 0,
        highAchievingCount: 0,
        highAchievingRate: 0
      },
      // 图表
      barOption: {},
      // 延期列表
      delayList: [],
      delayDrawer:false
    }
  },
  async created() {
    var query = this.$route.query
    console.log(query)
    if('year' in query){
      this.year = query.year
      this.month = query.month
    }
    // 初始化图表,表格数据
    await this.getFinishSubList()
    const topRate = +localStorage.getItem("pim_statistic_topRate")
    if (topRate !== 0)
      this.showTopRate = topRate
    const bottomRate = +localStorage.getItem("pim_statistic_bottomRate")
    if (bottomRate !== 0)
      this.showBottomRate = bottomRate
    this.barOption = this.$echarts.init(document.getElementById('charts-area'))
    this.initBar()
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
          item.startTime = formatDate(item.startTime)
          item.finishTime = formatDate(item.finishTime)
          item.executionDays = timeSub(item.startTime, item.finishTime)
          item.executionDays -= +item.unforcedDays
          item.chargeName = item.chargeName.join(",")
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
      if (row.achievingRate >= this.showTopRate)
        return 'background-color:#ABEFBA'
      else if (row.achievingRate >= this.showBottomRate)
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
        inputValue: this.showTopRate,
        inputPattern: /^0.\d+/,
        inputErrorMessage: '达成率必须是0-1之间的小数'
      }).then(({ value }) => {
        localStorage.setItem("pim_statistic_topRate", value)
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
    },
    changeBottomRate() {
      this.$prompt('请输入不良阈值下限，低于此达成率的阶段会标红显示', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.showBottomRate,
        inputPattern: /^0.\d+/,
        inputErrorMessage: '达成率必须是0-1之间的小数'
      }).then(({ value }) => {
        localStorage.setItem("pim_statistic_bottomRate", value)
        this.showBottomRate = value
        this.$message({
          type: 'success',
          message: '当前不良阈值下限是: ' + value
        });
        this.showPart()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        });
      });
    },
    initBar() {
      let result = Array.from({ length: 12 }, (_, i) => 0)
      for (var i = 0; i < this.finishSubList.length; i++) {
        result[Math.min(Math.floor(Math.round(this.finishSubList[i].achievingRate * 100) / 10), 11)]++
      }
      var baroption = {
        title: {
          text: '达成率分布',
        },
        xAxis: {
          data: Array.from({ length: 12 }, (_, i) => i <= 10 ? i * 10 : '100+'),
          name: '达成率(%)',
          axisLabel: {
            fontSize: 15
          }
        },
        yAxis: {

        },
        series: [
          {
            type: 'bar',
            data: result,
            label: {
              show: true,
              position: 'top',
              fontSize: 18,
            },
            itemStyle: {
              color: function (params) {
                if (params.dataIndex < 4)
                  return '#DA3BA8'
                else if (params.dataIndex < 7)
                  return '#D4E72E'
                else
                  return '#32E828'
              }
            }
          }]
      }
      this.barOption.setOption(baroption)
    },
    async updateView() {
      await this.getFinishSubList()
      this.initBar()
    },
    changeMonth(value) {
      this.month += value
      if (this.month === 0) {
        this.month = 12
        this.year -= 1
      } else if (this.month === 13) {
        this.month = 1
        this.year += 1
      }
      this.updateView()
    },
    // 双击表格显示延期原因
    showDelayReason(row, column) {
      if (column.label === "外界延期") {
        this.getUnforcedDays(row)
      } else if(column.label === '人为延期'){
        this.getApplyDelay(row)
      } else if(column.label === '专案'||column.label==='阶段'){
        this.$router.push({
          name:'子流程详情',
          query:{
            caseId:row.caseId,
            caseName:row.caseName
          }
        })
      }
    },
    async getUnforcedDays(row) {
      var res = await getDelayByStatus({ caseSubId: row.id, status: 1, delayType: '外界因素延期' })
      this.delayList = res.data
      this.delayList.map(item => {
        item.predictTime = formatDate(item.predictTime)
        item.type = "外界因素延期"
        item.caseName = row.caseName
        item.subName = row.subName
      })
      this.delayDrawer = true
    },
    async getApplyDelay(row) {
      var res = await getDelayByStatus({ caseSubId: row.id, status: 1, delayType: '人为因素延期' })
      this.delayList = res.data
      this.delayList.map(item => {
        item.predictTime = formatDate(item.predictTime)
        item.type = "人为因素延期"
        item.caseName = row.caseName
        item.subName = row.subName
      })
      this.delayDrawer = true
    },

  }
};
</script>

<style lang="less" scoped></style>