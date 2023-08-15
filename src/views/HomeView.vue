<template>
  <div class="home" style="text-align: center;">
    <div class="content">
      <div class="main">
        <div class="tableInfo">
          <div class="charts">
            <CasePie :info="pieInfo"></CasePie>
          </div>
          <label>执行状态总览</label>
          <CaseTable :caseInfo="caseInfo"></CaseTable>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import CasePie from '../components/CasePie'
import { formatDate, getStatus } from '@/utils/common'
export default {
  name:'homePage',
  components: { CasePie },
  data() {
    return {
      caseId: '',
      caseInfo: [],
      pieInfo: []
    }
  },
  mounted() {
    this.getCaseInfo()
  },
  methods: {
    // 1. 父组件获取到case数据
    // 1.1 向后端获取所有case数据，初始化表格
    // 2. 父组件将数据通过props的方式传递给子组件
    getCaseInfo() {
      this.$axios.get('case/list')
        .then(res => {
          this.caseInfo = res.data.data
          for (let i = 0; i < this.caseInfo.length; i++) {
            //后端拿到的是字符串格式的数据，转换为时间格式
            const startTime = new Date(this.caseInfo[i]['startTime'])
            this.caseInfo[i].startTime = formatDate(startTime)
            //获得今天的日期，用于计算执行天数（如果已经完成，则执行天数由结束之间-开始时间获得）
            const today = new Date()
            //目标完成时间
            //开始时间+各个阶段的计划时间
            //必须new一个新的，否则共用一个对象，修改一个，两个都改了
            var presetTime = new Date(startTime)
            presetTime.setDate(presetTime.getDate() + this.caseInfo[i].planDay)
            this.caseInfo[i].presetTime = formatDate(presetTime)

            //设置执行天数

            // 如果案子还没有完结
            if (this.caseInfo[i].finishTime === null) {
              //今天的时间-开始时间 获得已经执行的时间
              var doingDay = Math.ceil((today - startTime) / (3600 * 24 * 1000))
              this.caseInfo[i]['doingDay'] = doingDay

            } else {
              //案子已经完结
              var doingDay = Math.ceil((new Date(this.caseInfo[i].finishTime) - startTime) / (3600 * 24 * 1000))
              this.caseInfo[i]['doingDay'] = doingDay
              this.caseInfo[i].finishTime = formatDate(this.caseInfo[i].finishTime)
            }

            //显示当前阶段
            if (this.caseInfo[i].curStage === null)
              this.caseInfo[i].curStage = "已结案"

            //执行状态显示
            // 如果案子还没有完结
            this.caseInfo[i].status = getStatus(this.caseInfo[i].startTime, this.caseInfo[i].presetTime, this.caseInfo[i].finishTime)
          }
          this.pieInfo = this.caseInfo
        })
        .catch(error=>{

        })
    },

    //显示专案
    showCase() {
      this.loadingCase = true
      this.loadingSub = false
      this.pieInfo = this.caseInfo
    },
    //显示子流程
    showSub(caseId, caseName) {
      this.loadingCase = false
      this.loadingSub = true
      this.caseId = caseId
      this.getSubInfo(caseId, caseName)
    },
    //获取子流程的信息
    getSubInfo(caseId, caseName) {
      this.caseName = caseName
      this.$axios.get(`caseSub/list/${caseId}`)
        .then(result => {
          this.subInfo = result.data.data
          // console.log(this.subInfo)
          for (let i = 0; i < this.subInfo.length; i++) {
            this.subInfo[i].startTime = formatDate(this.subInfo[i].startTime)
            //目标时间
            this.subInfo[i].targetTime = this.getTargetTime(this.subInfo[i].startTime, this.subInfo[i].planDays)
            // 标准时间（计划天数+外界因素延期）
            this.subInfo[i].standardTime = this.getStandardTime(this.subInfo[i].startTime, this.subInfo[i].planDays, this.subInfo[i].unforcedDays)

            this.subInfo[i].finishTime = formatDate(this.subInfo[i].finishTime)
            this.subInfo[i].status = getStatus(this.subInfo[i].startTime, this.subInfo[i].standardTime, this.subInfo[i].finishTime)
          }
          this.pieInfo = this.subInfo
        })
    },
    //获取理想时间
    getTargetTime(startTime, planDay) {
      if (startTime === null)
        return null
      var presetTime = new Date(startTime)
      presetTime.setDate(presetTime.getDate() + planDay)
      return formatDate(presetTime)
    },

    //获取正常时间
    getStandardTime(startTime, planDay, unforcedDays) {
      //如果还未开始，则不显示正常时间
      if (startTime === null)
        return null
      var standardTime = new Date(startTime)
      standardTime.setDate(standardTime.getDate() + (planDay + unforcedDays))
      return formatDate(standardTime)
    },
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: row;
}

.content {
  display: flex;
}

.main {

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}


.main>>>label {
  display: block;
  font-size: 50px;
  padding-bottom: 20px;
  margin-top: 40px;
  align-content: center;
  margin-left: 0%;
}


.main>>>.tableInfo {
  width: 100%;
}

.main>>>.userCase {
  /* width: 30%; */
  /* background-color: pink; */
}

.el-button {
  margin-top: 20px;
}

.charts {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 30px;
}
</style>

