<template>
  <div class="home">
    <PIMHeader></PIMHeader>
    <div class="content">
      <PIMAside></PIMAside>
      <div class="main">
        <CaseTable v-show="loadingCase" @showSub="showSub" :caseInfo="caseInfo"></CaseTable>
        <div class="subInfo" v-show="loadingSub">
          <CaseSubTable :subInfo="subInfo" :caseName="caseName"></CaseSubTable>
          <el-button size="medium" type="primary " @click="showCase">返回</el-button>
        </div>
        <CasePie :info="pieInfo"></CasePie>
      </div>
    </div>
  </div>
</template>

<script>
import CasePie from '../components/CasePie'

export default {
  
  components:{CasePie},
  data() {
    return {
      loadingSub: false,
      loadingCase: true,
      caseId: '',
      subInfo: [],
      caseName: '',
      caseInfo: [],
      pieInfo:[]
    }
  },
  created() {
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
            this.caseInfo[i].startTime = this.formatDate(startTime)
            //获得今天的日期，用于计算执行天数（如果已经完成，则执行天数由结束之间-开始时间获得）
            const today = new Date()
            //预计完成时间
            //理想状态下的开始时间+预设时间==预计完成时间（多少天完成）
            //必须new一个新的，否则共用一个对象，修改一个，两个都改了
            var presetTime = new Date(startTime)
            presetTime.setDate(presetTime.getDate()+this.caseInfo[i].planDay)
            this.caseInfo[i].presetTime = this.formatDate(presetTime)

            //设置执行天数
            // 如果案子还没有完结
            if(this.caseInfo[i].finishTime===null){
              //今天的时间-开始时间 获得已经执行的时间
              var doingDay = Math.ceil((today - startTime) / (3600 * 24 * 1000))
              this.caseInfo[i]['doingDay'] = doingDay
              
            }else{
              //案子已经完结
              var doingDay = Math.ceil((new Date(this.caseInfo[i].finishTime) - startTime) / (3600 * 24 * 1000))
              this.caseInfo[i]['doingDay'] = doingDay
              this.caseInfo[i].finishTime = this.formatDate(this.caseInfo[i].finishTime)
            }

            //显示当前阶段
            if(this.caseInfo[i].curStage===null)
              this.caseInfo[i].curStage="已结案"

            //执行状态显示
            // 如果案子还没有完结
            var status = 0
            if(this.caseInfo[i].finishTime===null){
              //今天小于预计时间则正在执行，否则已延误
                if(this.formatDate(new Date())<=this.caseInfo[i].presetTime)
                  status = 0
                else
                  status = 2
            }else{
              //案子已经完结
              //完结小于预计时间则正常完成，否则延误完成
              if(this.formatDate(this.caseInfo[i].finishTime)<=this.caseInfo[i].presetTime)
                status = 1
              else
                status = 3
            }
            this.caseInfo[i].status = status
          }
          this.pieInfo = this.caseInfo
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
          console.log(this.subInfo)
          for (let i = 0; i < this.subInfo.length; i++) {
            this.subInfo[i].startTime = this.formatDate(this.subInfo[i].startTime)
            //目标时间
            this.subInfo[i].targetTime = this.getTargetTime(this.subInfo[i].startTime, this.subInfo[i].planDays)
            // 标准时间（计划天数+外界因素延期）
            this.subInfo[i].standardTime = this.getStandardTime(this.subInfo[i].startTime, this.subInfo[i].planDays, this.subInfo[i].unforcedDays)

            this.subInfo[i].finishTime = this.formatDate(this.subInfo[i].finishTime)
            this.subInfo[i].status = this.getStatus(this.subInfo[i])
          }
          this.pieInfo = this.subInfo
        })
    },
    //获取理想时间
    getTargetTime(startTime,planDay){
      var presetTime = new Date(startTime)
      presetTime.setDate(presetTime.getDate()+planDay)
      return this.formatDate(presetTime)
    },

    //获取正常时间
    getStandardTime(startTime,planDay, unforcedDays){
      //如果还未开始，则不显示正常时间
      if(startTime===null)
        return null
      var standardTime = new Date(startTime)
      standardTime.setDate(standardTime.getDate()+(planDay+unforcedDays))
      return this.formatDate(standardTime)
    },


    //格式化时间，按照yyyy-MM-dd的格式返回字符串
    formatDate(date) {
      if (date !== null) {
        date = new Date(date)
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate
      }
      else
        return null
    },

    //获取当前子流程的状态（前提：先把正常时间计算出来）
    getStatus(subInfo) {
      var status = 0
      if (subInfo.startTime === null)
        return 4
      //如果还没完成
      if (subInfo.finishTime === null) {
        //先获取今天的00：00：00的时间戳
        const today = new Date().setHours(0, 0, 0, 0)
        //和正常结束时间比较
        if (today - new Date(subInfo.standardTime) >= 0)
          status = 0
        else
          status = 2
      } else {
        //如果已经完成了
        const finishTime = new Date(subInfo.finishTime)
        const standardTime = new Date(subInfo.standardTime)
        //比正常完成时间少
        if (finishTime - standardTime <= 0)
          status = 1
        else
          status = 3
      }
      return status
    }
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  flex-direction: row;
}

.main {
  display: flex;
}

.el-button {
  margin-top: 20px;
}
</style>

