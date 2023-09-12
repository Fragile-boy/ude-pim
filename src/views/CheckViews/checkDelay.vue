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
        <el-card v-if="checkHistoryVisible === false">
            <div class="btns">
                <el-row>
                    <el-col :span="4" :offset="9">
                        <h1>审核延期申请</h1>
                    </el-col>
                    <el-col :span="2" :offset="9">
                        <el-button type="info" icon="el-icon-s-order" @click="openHistory()"> 历史记录 </el-button>
                    </el-col>
                </el-row>
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
        <!-- 显示审核记录的图层 -->
        <el-card v-if="checkHistoryVisible">
            <el-page-header @back="checkHistoryVisible = false" content="延期审核历史记录"></el-page-header>
            <el-table :data="checkedApplyList" style="width: 100%">
                <el-table-column label="结果">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.status === 1">通过</el-tag>
                        <el-tag effect="dark" type="danger" v-else-if="scope.row.status === 2">拒绝</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="rejectReason" label="拒绝原因">
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column prop="applyName" label="申请人">
                </el-table-column>
                <el-table-column prop="delayType" label="延期类型">
                </el-table-column>
                <el-table-column prop="applyReason" label="申请原因">
                </el-table-column>
                <el-table-column prop="applyDays" label="申请天数">
                </el-table-column>
                <el-table-column prop="predictTime" label="预计完成时间">
                </el-table-column>
                <el-table-column prop="createTime" label="申请时间">
                </el-table-column>
                <el-table-column prop="checkName" label="审核人" width="80">
                </el-table-column>
                <el-table-column prop="checkTime" label="审核时间">
                </el-table-column>
            </el-table>
            <el-pagination style="margin-top: 10px;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.page" :page-sizes="[5, 8, 10, 15]" :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import { getApplyList, judgeApply, delayHistory } from '@/api/caseDelayApply'
import { mapState } from 'vuex'
import { formatDate } from '@/utils/common'
import { format } from 'echarts'
export default {
    data() {
        return {
            tableData: [],
            //审核记录
            checkHistoryVisible: false,
            queryInfo: {
                page: 1,
                pageSize: 5
            },
            total: 0,
            //已审核的列表
            checkedApplyList: []
        }
    },
    computed: {
        ...mapState(['user'])
    },
    created() {
        const pageSize = +localStorage.getItem("pim_check_delay_pageSize")
        this.queryInfo.pageSize = pageSize === 0 ? 5 : pageSize
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
            row.status = status
            row.checkUser = this.user.id
            if (status === 2) {
                this.$prompt('请输入原因', '您正在拒绝申请', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(async ({ value }) => {
                    if (value === '' || value === null) {
                        this.$message.error("请输入拒绝原因")
                        return 0
                    }
                    row.rejectReason = value
                    const res = await judgeApply(row)
                    if (res.code === 200) {
                        this.$message.success("已拒绝审核")
                        this.getDelay()
                    } else
                        this.$message.error(res.msg)
                }).catch(() => {
                    //如果点击取消，则什么也不做
                })
            } else {
                const res = await judgeApply(row)
                if (res.code === 200) {
                    this.$message.success("已通过审核")
                    this.getDelay()
                } else
                    this.$message.error(res.msg)
            }
        },
        openHistory() {
            this.checkHistoryVisible = true
            this.checkHistory()
        },
        async checkHistory() {
            const res = await delayHistory(this.queryInfo)
            this.total = res.data.total
            this.checkedApplyList = res.data.records
            this.checkedApplyList.forEach(element => {
                element.predictTime = formatDate(element.predictTime)
            });
        },
        handleSizeChange(value) {
            localStorage.setItem("pim_check_delay_pageSize", value)
            this.queryInfo.pageSize = value
            this.queryInfo.page = 1
            this.checkHistory()
        },
        handleCurrentChange(value) {
            this.queryInfo.page = value
            this.checkHistory()
        }
    }
}
</script>

<style scoped></style>