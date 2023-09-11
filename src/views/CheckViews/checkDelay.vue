<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/index' }">主页</el-breadcrumb-item>
                <el-breadcrumb-item>审批流程</el-breadcrumb-item>
                <el-breadcrumb-item>延期申请</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card>
            <div class="btns">
                <el-button type="info" icon="el-icon-s-order"> 历史记录 </el-button>
            </div>
            <el-table :data="tableData" style="width: 100%" border>
                <el-table-column label="类型">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.caseSubId !== null">专案类</el-tag>
                        <el-tag effect="dark" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="info" v-else-if="scope.row.type === 1">临时事务</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column prop="delayType" label="延期类型">
                </el-table-column>
                <el-table-column prop="applyReason" label="延期原因">
                </el-table-column>
                <el-table-column prop="applyDays" label="申请天数">
                </el-table-column>
                <el-table-column prop="formatPredictTime" label="预计完成时间">
                </el-table-column>
                <el-table-column prop="applyName" label="申请人">
                </el-table-column>
                <el-table-column prop="applyTime" label="申请创建时间">
                </el-table-column>
                <el-table-column label="操作">

                    <template slot-scope="scope">
                        <el-button type="success" @click="handleCheck(scope.row, 1)">通过</el-button>
                        <el-button type="primary" @click="handleCheck(scope.row, 2)">拒绝</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
import { getApplyList, judgeApply } from '@/api/caseDelayApply'
import { mapState } from 'vuex'
import { formatDate } from '@/utils/common'
export default {
    data() {
        return {
            tableData: []
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        this.getDelay()
    },
    methods: {
        async getDelay() {
            var res = await getApplyList()
            this.tableData = res.data
            this.tableData.map(item => {
                item.applyTime = formatDate(item.createTime)
                item.formatPredictTime = formatDate(item.predictTime)
            })
        },
        async handleCheck(row, status) {
            //这里catch的return不能结束方法的执行，他表示该promise对象的返回值，所以用外部标志位来决定是否执行后面的逻辑
            var flag = 1
            if (status === 2) {
                flag = await this.$prompt('请输入原因', '您正在拒绝申请', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(({ value }) => {
                    if (value === '' || value === null) {
                        this.$message.error("请输入拒绝原因")
                        return 0
                    }
                    row.rejectReason = value
                    return 1
                }).catch(() => {
                    //如果点击取消，则什么也不做
                    return 0
                })
            }
            if (flag !== 0) {
                row.status = status
                row.checkUser = this.user.id
                // console.log(row)
                await judgeApply(row)
                this.$message.success("审核已完成")
                setTimeout(() => this.$router.go(0), 1000)
            }
        }
    }
}
</script>

<style scoped>
.btns {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
}
</style>