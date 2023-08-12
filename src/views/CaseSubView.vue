<template>
    <div class="content">
        <PIMAside></PIMAside>
        <div class="main">
            <div class="subInfo">
                <CaseSubTable :subInfo="subInfo" :caseName="caseName"></CaseSubTable>
                <el-button size="medium" type="primary ">返回</el-button>
            </div>
            <div class="charts">
                <CasePie :info="pieInfo"></CasePie>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return{
            pieInfo : [],
            subInfo : [],
            caseName:''
        }
    },
    created() {
        const caseId = this.$route.params.caseId
        this.caseName = this.$route.params.caseName
        this.getSubInfo(caseId, caseName)
    },
    methods: {
        //获取子流程的信息
        getSubInfo(caseId, caseName) {
            this.caseName = caseName
            this.$axios.get(`caseSub/list/${caseId}`)
                .then(result => {
                    this.subInfo = result.data.data
                    console.log(this.subInfo)
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
    }
}
</script>

<style></style>