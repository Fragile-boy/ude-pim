<template>
    <div class="subView" style="text-align: center;">
        <CaseSubTable :subInfo="subInfo" :caseName="caseName"></CaseSubTable>
        <router-link to="/"><el-button size="medium" type="primary ">返回</el-button></router-link>
    </div>
</template>

<script>
import { formatDate, getStatus, timeAdd } from '@/utils/common'

export default {
    data() {
        return {
            pieInfo: [],
            subInfo: [],
            caseName: 'SXX泛用裝LED&cover模組（B類）',
        }
    },
    created() {
        const caseId = this.$route.query.caseId
        this.caseName = this.$route.query.caseName
        this.getSubInfo(caseId)
    },
    methods: {
        //获取子流程的信息
        getSubInfo(caseId) {
            this.$axios.get(`caseSub/list/${caseId}`)
                .then(result => {
                    this.subInfo = result.data.data
                    console.log(this.subInfo)
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
                        else
                            this.subInfo[i].ideaTime = timeAdd(this.subInfo[i - 1].ideaTime, this.subInfo[i].planDays)
                        //实际完成时间
                        this.subInfo[i].finishTime = formatDate(this.subInfo[i].finishTime)
                        this.subInfo[i].status = getStatus(this.subInfo[i].startTime, this.subInfo[i].standardTime, this.subInfo[i].finishTime)
                    }
                    this.pieInfo = this.subInfo
                })
        },
    }
}
</script>

<style scoped></style>