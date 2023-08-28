<template>
    <div class="subView" style="text-align: center;">
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>专案管理</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ caseName }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <CaseSubTable :subInfo="subInfo" :caseName="caseName"></CaseSubTable>
    </div>
</template>

<script>
import { formatDate, getStatus, timeAdd } from '@/utils/common'
import { getSubList } from '@/api/caseSub'

export default {
    data() {
        return {
            pieInfo: [],
            subInfo: [],
            caseName: '',
        }
    },
    created() {
        const caseId = this.$route.query.caseId
        this.caseName = this.$route.query.caseName
        this.getSubInfo(caseId)
    },
    methods: {
        //获取子流程的信息
        async getSubInfo(caseId) {
            var res = await getSubList(caseId)
            this.subInfo = res.data
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
        },
    }
}
</script>

<style scoped></style>