<template>
  <div class="index_container">
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
        <el-breadcrumb-item>个人总览</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <!-- 头部区域 -->
      <div class="userHeader">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-input placeholder="输入专案查询"></el-input>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" icon="el-icon-search"></el-button>
          </el-col>
          <!-- 消息区域 -->
          <el-col :span="1" :offset="15">
            <el-badge :value="12" class="item">
              <el-button round><i class="el-icon-chat-dot-round"></i></el-button>
            </el-badge>
          </el-col>
          <el-col :span="1">
            <el-badge :value="12" class="item">
              <el-button round><i class="el-icon-message-solid"></i></el-button>
            </el-badge>
          </el-col>

        </el-row>
      </div>
      <!-- 卡片区域 -->
      <div class="applyArea">
        <caseStatus></caseStatus>
      </div>
      <!-- 执行任务区域 -->
      <div class="task-container">
        <el-card class="taskTable">
          <h2>最近任务</h2>
          <el-table :data="taskList" style="margin-bottom: 15px;">
            <el-table-column>
              <template slot-scope="scope">
                <el-tag effect="dark" type="success" v-if="scope.row.type === 0">专案类</el-tag>
                <el-tag effect="dark" type="warning" v-if="scope.row.type === 1">临时事务</el-tag>
                <el-tag effect="dark" v-if="scope.row.type === 2">技术研究</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description"></el-table-column>
            <el-table-column>
              <template slot-scope="scope">
                <el-progress :text-inside="true" :stroke-width="26" :percentage="+scope.row.percentage"
                  :status="scope.row.percentage >= 60 ? scope.row.percentage == 100 ? 'exception' : 'warning' : 'success'"></el-progress>
              </template>
            </el-table-column>
          </el-table>


          <el-row>
            <el-col :span="3" :offset="10">
              <el-link type="primary">显示所有任务</el-link>
            </el-col>
          </el-row>
        </el-card>

        <!-- 图表 -->
        <el-card class="taskCharts">
          <div v-if="this.taskList.length!==0">
            <div style="display: inline-block;">
              <h1>任务类型</h1>
              <div id="typePie" style="width: 350px; height: 300px;"></div>
            </div>

            <div style="display: inline-block;">
              <h1>执行情况</h1>
              <div id="statusPie" style="width: 350px; height: 300px; "></div>
            </div>
          </div>
          <el-empty v-else description="欢迎新人，今后这里会是你的任务展示区域哦！"></el-empty>
        </el-card>
      </div>

      <!-- 链接区域 -->
      <div class="notice-container">
        <el-card>
          <h2 style="margin-bottom: 10px;">快捷访问</h2>
          <div class="link-container">
            <el-link type="primary" target="_blank" href="https://scmail.ude-corp.com/">邮件系统<i class="el-icon-s-promotion"></i></el-link>
            <el-link type="primary">申请子流程<i class="el-icon-plus"></i></el-link>
            <el-link type="primary">申请技术研究<i class="el-icon-plus"></i></el-link>
            <el-link type="primary">专案主页<i class="el-icon-view"></i></el-link>
            <el-link type="info">待定</el-link>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { taskList } from '@/api/task'
import { timeSub } from '@/utils/common'
export default {
  data() {
    return {
      taskList: [],
      pieChart: null,
      statusPie: null
    }
  },
  computed: {
    ...mapState(['user'])
  },
  created() {

  },
  async mounted() {
    await this.initTaskList()
    this.typePie = this.$echarts.init(document.getElementById('typePie'));
    this.statusPie = this.$echarts.init(document.getElementById('statusPie'));

    this.renderPieChart()
  },
  methods: {
    async initTaskList() {
      const res = await taskList(this.user.id)
      if (res.code === 200) {
        this.taskList = res.data
        for (var i = 0; i < this.taskList.length; i++) {
          this.taskList[i].percentage = (timeSub(this.taskList[i].startTime, new Date()) * 100.0 / this.taskList[i].planDays).toFixed()
          if (this.taskList[i].percentage >= 100)
            this.taskList[i].percentage = 100
        }
        console.log(this.taskList)
      } else {
        this.$message.error(res.msg)
      }
    },
    //初始化显示图表
    renderPieChart() {
      var typeData = [
        {
          name: '专案类',
          value: 0
        }, {
          name: '临时事务',
          value: 0
        }, {
          name: '技术研究', value: 0
        }]

      var statusData = [
        {
          name: '已延误',
          value: 0
        },
        {
          name: '时间过半',
          value: 0
        },
        {
          name: '正在执行',
          value: 0
        }
      ]
      this.taskList.forEach(s => {
        typeData[s.type].value += 1
        console.log(typeof (s.percentage))
        if (+s.percentage === 100)
          statusData[0].value += 1
        else if (+s.percentage >= 60)
          statusData[1].value += 1
        else
          statusData[2].value += 1
      })
      console.log(statusData)
      // 计算属性值的数量
      const typeOption = {
        legend: {
          orient: 'vertical',
          x: 'left',
          data: ['专案类', '临时事务', '技术研究']
        },
        series: [
          {
            type: 'pie',
            data: typeData,
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              color: function (params) {
                if (params.data.name === "专案类")
                  return '#67c23a'
                else if (params.data.name === "临时事务")
                  return '#e6a23c'
                else if (params.data.name === "技术研究")
                  return '#409eff'
              }
            },
            labelLine: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
          }
        ]
      };
      // 计算属性值的数量
      const statusOption = {
        legend: {
          orient: 'vertical',
          x: 'left',
          data: ['已延误', '时间过半', '正在执行']
        },
        series: [
          {
            type: 'pie',
            data: statusData,
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              color: function (params) {
                if (params.data.name === "已延误")
                  return '#f56c6c'
                else if (params.data.name === "时间过半")
                  return '#e6a23c'
                else if (params.data.name === "正在执行")
                  return '#67c23a'
              }
            },
            labelLine: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
          }
        ]
      };
      this.typePie.setOption(typeOption);
      this.statusPie.setOption(statusOption);
    },
  }
}
</script>

<style lang="less" scoped>
.el-button {
  border: none;
}

.applyArea {
  margin-top: 30px;
  margin-bottom: 30px;
  width: 100%;
}

.task-container {
  display: flex;
  justify-content: space-between;
}

.taskTable {
  width: 50%;
  margin-right: 10px;
}

.taskCharts {
  width: 50%;
}

.notice-container {
  margin-top: 20px;
  .link-container{
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    margin: 0 30px;
  }

  .el-link{
    font-size: 15px;
  }
}
</style>