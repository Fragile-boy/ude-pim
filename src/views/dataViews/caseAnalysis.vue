<template>
  <div>
    <!-- 面包屑导航区域 -->
    <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>专案分析</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card>
      <div id="ganttChart" style="width: 100%; height: 700px;"></div>
      <el-row style="margin-bottom: 10px;">
        <el-col :span="1">
          <el-button icon="el-icon-back" round type="primary" @click="nextPage(-1)"></el-button>
        </el-col>
        <el-col :span="1">
          <el-button icon="el-icon-right" round type="primary" @click="nextPage(1)"></el-button>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="1" :offset="23">
          <el-button type="danger" icon="el-icon-circle-close" @click="showCaseSubGantt = false"
            v-show="showCaseSubGantt"></el-button>
        </el-col>
      </el-row>

      <div id="caseSubGanttChart" style="width: 100%; height: 1000px;" v-show="showCaseSubGantt"></div>
      <div id="caseSubBarChart" style="width: 100%; height: 700px;" v-show="showCaseSubGantt"></div>
    </el-card>
  </div>
</template>

<style lang="less" scoped></style>

<script>
import { mapActions, mapState } from 'vuex'
import { timeAdd, formatDate, timeSub } from '@/utils/common'
import { getSubList } from '@/api/caseSub'
import { getCaseList } from '@/api/case'
export default {
  name: 'caseAnalysis',
  data() {
    return {
      finishCaseList: [],
      page: 1,
      pageSize: 5,
      totalPage: null,
      subInfo: [],
      caseId: null,
      map: new Map(),
      showCaseSubGantt: false,
      caseList: []
    }
  },
  async created() {
    await this.getFinishedCaseList(true)
    for (let i = 0; i < this.caseList.length; i++) {
      this.map.set(this.caseList[i].name, this.caseList[i])
    }
    this.finishCaseList = this.caseList.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
    this.totalPage = Math.ceil(this.caseList.length / this.pageSize)
    this.gantt = this.$echarts.init(document.getElementById('ganttChart'))
    this.initGantt()
  },
  methods: {
    async getFinishedCaseList() {
      var res = await getCaseList(true)
      res = res.data
      for (let i = 0; i < res.length; i++) {
        if (res[i].startTime === null)
          continue
        //后端拿到的是字符串格式的数据，转换为时间格式
        const startTime = new Date(res[i]['startTime'])
        res[i].startTime = formatDate(startTime)
        if (res[i].finishTime !== null)
          res[i].finishTime = formatDate(new Date(res[i]['finishTime']))
        //目标完成时间
        //开始时间+各个阶段的计划时间
        //必须new一个新的，否则共用一个对象，修改一个，两个都改了
        var presetTime = new Date(startTime)
        presetTime.setDate(presetTime.getDate() + res[i].planDay - 1)
        res[i].presetTime = formatDate(presetTime)

        //设置执行天数(2023.11.3 已经在后端完成计算)

        //显示当前阶段
        if (res[i].curStage === null)
          res[i].curStage = "已结案"
      }

      // 获取的是已完成的专案，则按照完结时间倒序排序
      res.sort((a, b) => {
        return new Date(b.finishTime) - new Date(a.finishTime)
      })
      this.caseList = res
    },
    // 获得专案对应子流程执行情况
    async getSubInfo(caseId) {
      var res = await getSubList(caseId)
      this.subInfo = res.data
      for (let i = 0; i < this.subInfo.length; i++) {
        this.subInfo[i].startTime = formatDate(this.subInfo[i].startTime)
        if (this.subInfo[i].startTime !== null) {
          //阶段目标时间
          this.subInfo[i].targetTime = timeAdd(this.subInfo[i].startTime, this.subInfo[i].planDays)
          // 目标完成时间（计划天数+外界因素延期）
          this.subInfo[i].standardTime = timeAdd(this.subInfo[i].startTime, this.subInfo[i].planDays, this.subInfo[i].unforcedDays)
        }
        // 预计完成时间
        if (i === 0)
          this.subInfo[i].ideaTime = this.subInfo[i].targetTime
        else if (typeof (this.subInfo[i - 1].ideaTime) !== 'undefined') {
          this.subInfo[i].ideaTime = timeAdd(this.subInfo[i - 1].ideaTime, this.subInfo[i].planDays)
        }
        //实际完成时间
        this.subInfo[i].finishTime = formatDate(this.subInfo[i].finishTime)
      }
    },
    // 初始化数据显示格式
    initGanttObj(obj, stack, start, color, zlevel, name, fullTime) {
      obj.name = name
      obj.stack = stack
      obj.type = "bar";
      obj.label = {
        show: true,
        color: "#000",
        // position: fullTime ? "insideTopRight" : "right",
        position: "right",
        fontSize: 16,
        formatter: function (params) {
          var data = new Date(params.value)
          if (fullTime) {
            if (zlevel === 4 || zlevel === 1 || zlevel === 2)
              return ('' + data.getFullYear()).substring(2, 4) + "-" + (data.getMonth() + 1) + "-" + data.getDate()
            return ''
          } else {
            if (zlevel === 1 || zlevel === 2)
              return data.getMonth() + 1 + "-" + data.getDate()
            return ''
          }
        }
      }
      obj.zlevel = zlevel
      if (start) {
        obj.itemStyle = {
          color: "#fff"
        }
      } else {
        obj.itemStyle =
        {
          color: color,
          borderColor: "#fff",
          borderWidth: 2,
        }
      }
      obj.data = []
      return obj
    },
    // 初始化甘特图
    initGantt() {
      // y轴标签
      let yAxis = []
      // series数据集
      var dataSeries = []
      // 开始时间
      var startTime_0 = {}
      var startTime_1 = {}
      startTime_0 = this.initGanttObj(startTime_0, "bar0", true, "#fff", 4, "开始时间", true)
      startTime_1 = this.initGanttObj(startTime_1, "bar1", true, "#fff", 4, "开始时间", true)
      // 预计完成时间
      var predictTime = {}
      predictTime = this.initGanttObj(predictTime, "bar0", false, "#6ED77E", 3, "预计完成", true)
      // 目标时间
      var targetTime = {}
      targetTime = this.initGanttObj(targetTime, "bar0", false, "skyblue", 2, "目标时间", true)
      // 完结时间
      var finishTime = {}
      finishTime = this.initGanttObj(finishTime, "bar1", false, "#FF7F50", 1, "完成时间", true)
      for (let i = this.finishCaseList.length - 1; i >= 0; i--) {
        startTime_0.data.push(new Date(this.finishCaseList[i].startTime))
        startTime_1.data.push(new Date(this.finishCaseList[i].startTime))
        predictTime.data.push(new Date(this.finishCaseList[i].presetTime))
        targetTime.data.push(new Date(timeAdd(this.finishCaseList[i].presetTime, this.finishCaseList[i].unforcedDay === null ? 0 : this.finishCaseList[i].unforcedDay, 1)))
        finishTime.data.push(new Date(this.finishCaseList[i].finishTime))
        yAxis.push(this.finishCaseList[i].name)
      }

      dataSeries.push(startTime_0)
      dataSeries.push(startTime_1)
      dataSeries.push(predictTime)
      dataSeries.push(targetTime)
      dataSeries.push(finishTime)

      var option = {
        backgrindColor: "#fff",
        title: {
          text: "专案完结甘特图",
          padding: 20,
          textStyle: {
            fontSize: 17,
            fontWeight: "bolder",
            color: "#333"
          },
          subtextStyle: {
            fontSize: 13,
            fontWeight: "bolder"
          }
        },
        legend: {
          data: ['开始时间', '预计完成', '目标时间', '完成时间'],
          align: "right",
          right: 80,
          top: 50
        },
        grid: {
          containLabel: true,
          show: false,
          right: 130,
          left: 40,
          bottom: 40,
          top: 90
        },
        xAxis: {
          type: "time",
          axisLabel: {
            show: true,
            interval: 0,
            formatter: function (value) {
              var data = new Date(value);
              var year = data.getFullYear();
              var month = data.getMonth() + 1;
              var day = data.getDate();

              if (day > 1) {
                // 如果是天，字体大小为30
                return '{fontSizeMini|' + day + '}';
              } else if (month > 1) {
                // 如果是月份，字体大小为原始大小
                return '{fontSize|' + month + '月' + '}';
              } else {
                // 如果是年份，字体大小为原始大小
                return '{fontSizeLarge|' + year + '年' + '}';
              }
            },
            rich: {
              fontSizeMini: {
                fontSize: 20
              },
              fontSize: {
                fontSize: 25
              },
              fontSizeLarge: {
                fontSize: 30
              }

            },
          }
        },
        yAxis: {
          axisLabel: {
            show: true,
            interval: 0,
            fontSize: 15,
            fontWeight: "bolder"
          },
          data: yAxis
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            var res = ''
            res += params[0].axisValue + '<br/>';
            var set = new Set();
            for (var i = 0; i < params.length; i++) {
              if (set.has(params[i].seriesName))
                continue
              set.add(params[i].seriesName)
              res += '<div style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:' + params[i].color + ';"></div>' +
                params[i].seriesName + '：' + formatDate(params[i].value) + '<br/>'
            }
            return res
          }
        },
        series: dataSeries,
      }
      this.gantt.setOption(option);
      this.gantt.on('click', async (params) => {
        var caseObj = this.map.get(params.name)
        this.caseId = caseObj.id
        await this.getSubInfo(this.caseId)
        this.showCaseSubGantt = true
        setTimeout(() => {
          this.caseSubGantt = this.$echarts.init(document.getElementById('caseSubGanttChart'))
          this.caseSubBar = this.$echarts.init(document.getElementById('caseSubBarChart'))
          this.initCaseSubGantt(params.name, caseObj)
          this.initCaseSubBar(params.name, caseObj)
        }, 100)
        // params 会包含点击的图表元素的各种信息，如name, dataIndex, data等。
      });
    },
    // 更新甘特图
    updateGantt() {
      // y轴标签
      let yAxis = []
      // series数据集
      var dataSeries = []
      // 开始时间
      var startTime_0 = {}
      var startTime_1 = {}
      startTime_0 = this.initGanttObj(startTime_0, "bar0", true, "#fff", 4, "开始时间", true)
      startTime_1 = this.initGanttObj(startTime_1, "bar1", true, "#fff", 4, "开始时间", true)
      // 预计完成时间
      var predictTime = {}
      predictTime = this.initGanttObj(predictTime, "bar0", false, "#6ED77E", 3, "预计完成", true)
      // 目标时间
      var targetTime = {}
      targetTime = this.initGanttObj(targetTime, "bar0", false, "skyblue", 2, "目标时间", true)
      // 完结时间
      var finishTime = {}
      finishTime = this.initGanttObj(finishTime, "bar1", false, "#FF7F50", 1, "完成时间", true)
      for (let i = this.finishCaseList.length - 1; i >= 0; i--) {
        startTime_0.data.push(new Date(this.finishCaseList[i].startTime))
        startTime_1.data.push(new Date(this.finishCaseList[i].startTime))
        predictTime.data.push(new Date(this.finishCaseList[i].presetTime))
        targetTime.data.push(new Date(timeAdd(this.finishCaseList[i].presetTime, this.finishCaseList[i].unforcedDay === null ? 0 : this.finishCaseList[i].unforcedDay, 1)))
        finishTime.data.push(new Date(this.finishCaseList[i].finishTime))
        yAxis.push(this.finishCaseList[i].name)
      }
      dataSeries.push(startTime_0)
      dataSeries.push(startTime_1)
      dataSeries.push(predictTime)
      dataSeries.push(targetTime)
      dataSeries.push(finishTime)
      var option = {
        yAxis: {
          axisLabel: {
            show: true,
            interval: 0,
            fontSize: 15,
            fontWeight: "bolder"
          },
          data: yAxis
        },
        series: dataSeries
      }
      this.gantt.setOption(option)
    },
    // 翻页
    nextPage(value) {
      this.page += value
      if (this.page <= 0) {
        this.$message.warning("当前已是第一页")
        this.page = 1
        return
      } else if (this.page > this.totalPage) {
        this.$message.warning("当前已是最后一页")
        this.page = this.totalPage
        return
      } else {
        this.$message.warning(`当前第${this.page}页,共${this.totalPage}页`)
        this.finishCaseList = this.caseList.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
        this.updateGantt()
      }
    },
    // 初始化子流程甘特图
    initCaseSubGantt(caseName, caseObj) {
      // y轴标签
      let yAxis = []
      // series数据集
      var dataSeries = []
      // 开始时间
      var startTime_1 = {}
      var startTime_2 = {}
      startTime_1 = this.initGanttObj(startTime_1, "bar0", true, "#fff", 4, "开始时间", false)
      startTime_2 = this.initGanttObj(startTime_2, "bar1", true, "#fff", 4, "开始时间", false)
      // 预计完成时间
      var predictTime = {}
      predictTime = this.initGanttObj(predictTime, "bar0", false, "#6ED77E", 3, "预计完成", false)
      // 目标时间
      var targetTime = {}
      targetTime = this.initGanttObj(targetTime, "bar0", false, "skyblue", 2, "目标时间", false)
      // 完结时间
      var finishTime = {}
      finishTime = this.initGanttObj(finishTime, "bar1", false, "#FF7F50", 1, "完成时间", false)
      for (let i = this.subInfo.length - 1; i >= 0; i--) {
        startTime_1.data.push(new Date(this.subInfo[i].startTime))
        startTime_2.data.push(new Date(this.subInfo[i].startTime))
        predictTime.data.push(new Date(this.subInfo[i].targetTime))
        targetTime.data.push(new Date(this.subInfo[i].standardTime))
        finishTime.data.push(new Date(this.subInfo[i].finishTime))
        yAxis.push(this.subInfo[i].subName)
      }

      // 计划工期显示
      yAxis.push("计划工期")
      startTime_1.data.push(new Date(this.subInfo[0].startTime))
      startTime_2.data.push(new Date(this.subInfo[0].startTime))
      predictTime.data.push(new Date(caseObj.presetTime))
      targetTime.data.push(new Date(timeAdd(caseObj.presetTime, caseObj.unforcedDay === null ? 0 : caseObj.unforcedDay, 1)))
      finishTime.data.push(new Date(timeAdd(caseObj.startTime, caseObj.unforcedDay === null ? 0 : caseObj.unforcedDay, 1, caseObj.executionDays)))

      dataSeries.push(startTime_1)
      dataSeries.push(startTime_2)
      dataSeries.push(predictTime)
      dataSeries.push(targetTime)
      dataSeries.push(finishTime)

      var option = {
        backgrindColor: "#fff",
        title: {
          text: caseName,
          padding: 20,
          textStyle: {
            fontSize: 24,
            fontWeight: "bolder",
            color: "#333"
          },
          subtextStyle: {
            fontSize: 13,
            fontWeight: "bolder"
          }
        },
        legend: {
          data: ['开始时间', '预计完成', '目标时间', '完成时间'],
          align: "right",
          right: 80,
          top: 50
        },
        grid: {
          containLabel: true,
          show: false,
          right: 130,
          left: 40,
          bottom: 40,
          top: 90
        },
        xAxis: {
          type: "time",
          axisLabel: {
            show: true,
            interval: 0,
            formatter: function (value) {
              var data = new Date(value);
              var year = data.getFullYear();
              var month = data.getMonth() + 1;
              var day = data.getDate();

              if (day > 1) {
                // 如果是天，字体大小为30
                return '{fontSizeMini|' + day + '}';
              } else if (month > 1) {
                // 如果是月份，字体大小为原始大小
                return '{fontSize|' + month + '月' + '}';
              } else {
                // 如果是年份，字体大小为原始大小
                return '{fontSizeLarge|' + year + '年' + '}';
              }
            },
            rich: {
              fontSizeMini: {
                fontSize: 20
              },
              fontSize: {
                fontSize: 25
              },
              fontSizeLarge: {
                fontSize: 30
              }

            },
          }
        },
        yAxis: {
          axisLabel: {
            show: true,
            interval: 0,
            fontSize: 15,
            fontWeight: "bolder"
          },
          data: yAxis
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            var res = ''
            res += params[0].axisValue + '<br/>';
            var set = new Set()
            for (var i = 0; i < params.length; i++) {
              if (set.has(params[i].seriesName))
                continue
              set.add(params[i].seriesName)
              res += '<div style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:' + params[i].color + ';"></div>' +
                params[i].seriesName + '：' + formatDate(params[i].value) + '<br/>'
            }
            if (params[params.length - 1].value > params[params.length - 2].value) {
              res += '延期' + (timeSub(params[params.length - 2].value, params[params.length - 1].value) - 1) + "天"
            } else {
              res += '提前' + (timeSub(params[params.length - 1].value, params[params.length - 2].value) - 1) + "天"
            }
            return res
          }
        },
        series: dataSeries,
      }
      this.caseSubGantt.setOption(option);
    },
    // 初始化子流程条形图
    initCaseSubBar(caseName, caseObj) {

      this.subInfo.forEach(item => {
        item.executionDays = timeSub(item.startTime, item.finishTime)
        item.executionDays -= +item.unforcedDays
      })
      var option = {
        backgrindColor: "#fff",
        title: {
          text: caseName + "  执行条形图",
          padding: 20,
          textStyle: {
            fontSize: 17,
            fontWeight: "bolder",
            color: "#333"
          },
          subtextStyle: {
            fontSize: 13,
            fontWeight: "bolder"
          }
        },
        legend: {
          data: ['计划时间', '执行时间'],
          align: "right",
          right: 80,
          top: 50
        },
        grid: {
          containLabel: true,
          show: false,
          right: 130,
          left: 40,
          bottom: 40,
          top: 90
        },
        xAxis: {
          axisLabel: {
            show: true,
            interval: 0,
            fontSize: 20,
            fontWeight: "bolder"
          },
          data: this.subInfo.map(item => item.subName)
        },
        yAxis: {
          axisLabel: {
            show: true,
            interval: 0,
            fontSize: 15,
            fontWeight: "bolder"
          },
        },
        tooltip: {
          trigger: "axis",
          // formatter: function (params) {
          // }
        },
        series: [
          {
            name: '计划时间',
            type: 'bar',
            data: this.subInfo.map(item => item.planDays),
            label: {
              show: true,
              position: 'top',
            }
          }, {
            name: '执行时间',
            type: 'bar',
            data: this.subInfo.map(item => item.executionDays),
            label: {
              show: true,
              position: 'top',
            }
          }
        ]
      }
      this.caseSubBar.setOption(option);
    }
  }
}
</script>

