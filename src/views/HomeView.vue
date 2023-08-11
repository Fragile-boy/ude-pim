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
            // console.log(typeof(this.caseInfo[i]['startTime']))
            const startTime = new Date(this.caseInfo[i]['startTime'])
            const endTime = new Date(this.caseInfo[i]['presetTime'])
            const today = new Date()
            //理想状态下的完成时间-开始时间 获得预设时间（多少天完成）
            var presetDay = (endTime - startTime) / (3600 * 24 * 1000)
            //今天的时间-开始时间 获得已经执行的时间
            var doingDay = Math.ceil((today - startTime) / (3600 * 24 * 1000))
            this.caseInfo[i]['presetDay'] = presetDay
            this.caseInfo[i]['doingDay'] = doingDay
            this.caseInfo[i].startTime = this.formatDate(startTime)
            this.caseInfo[i].presetTime = this.formatDate(endTime)
            switch (this.caseInfo[i].status) {
              case 0:
                this.caseInfo[i].status = "正在执行"
                break
              case 1:
                this.caseInfo[i].status = "已完成"
                break
              case 2:
                this.caseInfo[i].status = "已延误"
                break
              case 3:
                this.caseInfo[i].status = "延误完成"
                break
            }
          }
          this.pieInfo = this.caseInfo
        })
    },


    showCase() {
      this.loadingCase = true
      this.loadingSub = false
      this.pieInfo = this.caseInfo
    },
    showSub(caseId, caseName) {
      this.loadingCase = false
      this.loadingSub = true
      this.caseId = caseId
      this.getSubInfo(caseId, caseName)
    },
    getSubInfo(caseId, caseName) {
      this.caseName = caseName
      this.$axios.get(`caseSub/list/${caseId}`)
        .then(result => {
          this.subInfo = result.data.data
          for (let i = 0; i < this.subInfo.length; i++) {
            this.subInfo[i].startTime = this.formatDate(this.subInfo[i].startTime)
            this.subInfo[i].idealTime = this.formatDate(this.subInfo[i].idealTime)
            this.subInfo[i].targetTime = this.formatDate(this.subInfo[i].targetTime)
            this.subInfo[i].standardTime = this.formatDate(this.subInfo[i].standardTime)
            this.subInfo[i].finishTime = this.formatDate(this.subInfo[i].finishTime)
            this.subInfo[i].status = this.getStatus(this.subInfo[i])
          }
          this.pieInfo = this.subInfo
        })
    },
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
    getStatus(subInfo) {
      var status = ''
      if (subInfo.startTime === null)
        return "未开始"
      //如果还没完成
      if (subInfo.finishTime === null) {
        //先获取今天的00：00：00的时间戳
        const today = new Date().setHours(0, 0, 0, 0)
        //和正常结束时间比较
        if (today - new Date(subInfo.standardTime) >= 0)
          status = "正在执行"
        else
          status = "已延误"
      } else {
        //如果已经完成了
        const finishTime = new Date(subInfo.finishTime)
        const standardTime = new Date(subInfo.standardTime)
        //比正常完成时间少
        if (finishTime - standardTime <= 0)
          status = "正常完成"
        else
          status = "延误完成"
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

