<template>
    <div>
        <!-- 面包屑导航区域 -->
        <div>
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>审批流程</el-breadcrumb-item>
                <el-breadcrumb-item>技术研究申请</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-card v-if="checkTaskHistoryVisible === false">
            <div class="btns">
                <el-row>
                    <el-col :span="4" :offset="9">
                        <h1>审核任务申请</h1>
                    </el-col>
                    <el-col :span="2" :offset="9">
                        <el-button type="info" icon="el-icon-s-order" @click="openHistory()"> 历史记录 </el-button>
                    </el-col>
                </el-row>
            </div>
            <el-table :data="taskList">
                <el-table-column label="类别">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="warning" v-if="scope.row.type === 1">临时事务</el-tag>
                        <el-tag effect="dark" type="primary" v-else-if="scope.row.type === 2">技术研究</el-tag>
                        <el-tag effect="dark" type="primary" v-else-if="scope.row.type === 3">微阶段</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="描述">
                    <template slot-scope="scope">
                        <div style="white-space: pre-wrap;">{{ scope.row.description }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="planDays" label="计划天数"></el-table-column>
                <el-table-column label="工作负荷">
                    <template slot-scope="scope">
                        {{ scope.row.estimatedWorkload || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="predictTime" label="预计完成时间"></el-table-column>
                <el-table-column prop="applyName" label="申请人"></el-table-column>
                <el-table-column prop="createTime" label="申请时间"></el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="success" @click="openApproveDialog(scope.row)" size="mini">通 过</el-button>
                        <el-button type="primary" @click="judgeApply(scope.row, 2)" size="mini">拒 绝</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 显示审核记录的图层 -->
        <el-card v-else-if="checkTaskHistoryVisible">
            <el-page-header @back="checkTaskHistoryVisible = false" content="任务申请审核历史记录"></el-page-header>
            <el-table :data="applyHistoryList" style="width: 100%">
                <el-table-column label="结果">
                    <template slot-scope="scope">
                        <el-tag effect="dark" type="success" v-if="scope.row.status === 1">通过</el-tag>
                        <el-tag effect="dark" type="danger" v-else-if="scope.row.status === 2">拒绝</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="comment" label="拒绝原因">
                </el-table-column>
                <el-table-column prop="description" label="描述">
                </el-table-column>
                <el-table-column prop="planDays" label="计划时间">
                </el-table-column>
                <el-table-column label="工作负荷">
                    <template slot-scope="scope">
                        {{ scope.row.estimatedWorkload || '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="predictTime" label="预计完成时间">
                </el-table-column>
                <el-table-column prop="applyName" label="申请人">
                </el-table-column>
                <el-table-column prop="createTime" label="申请时间">
                </el-table-column>
                <el-table-column prop="checkName" label="审核人">
                </el-table-column>
                <el-table-column prop="checkTime" label="审核时间">
                </el-table-column>
            </el-table>
            <el-pagination style="margin-top: 10px;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page="queryInfo.page" :page-sizes="[5, 8, 10, 15]"
                :page-size="queryInfo.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 审批对话框 -->
        <el-dialog title="审批申请" :visible.sync="approveDialogVisible" width="50%">
            <el-form ref="approveFormRef" :model="approveObj" label-width="100px">
                <el-form-item label="任务类型">
                    <el-input v-model="approveObj.typeText" disabled></el-input>
                </el-form-item>
                <el-form-item label="申请人">
                    <el-input v-model="approveObj.applyName" disabled></el-input>
                </el-form-item>
                <el-form-item label="任务描述">
                    <el-input type="textarea" v-model="approveObj.description" placeholder="可编辑任务描述"></el-input>
                </el-form-item>
                <el-form-item label="工作负荷">
                    <el-input type="number" v-model.number="approveObj.estimatedWorkload" placeholder="可编辑工作负荷"></el-input>
                </el-form-item>
                <el-form-item label="计划天数">
                    <el-input type="number" v-model.number="approveObj.planDays" placeholder="可编辑计划天数"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="approveDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitApprove()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { applyList, judgeApply, applyHistoryList } from '@/api/applyTask'
import { timeAdd, initTaskTypeOptions } from '@/utils/common'
import { mapActions, mapState } from 'vuex'
export default {
    data() {
        return {
            applyList: [],
            checkTaskHistoryVisible: false,
            queryInfo: {
                page: 1,
                pageSize: 7
            },
            total: 0,
            applyHistoryList: [],
            // 审批对话框相关
            approveDialogVisible: false,
            approveObj: {
                id: null,
                type: null,
                typeText: '',
                applyName: '',
                applyId: null,
                description: '',
                estimatedWorkload: null,
                planDays: null,
                createTime: null,
                comment: null,
                status: null,
                checkUser: null
            }
        }
    },
    created() {
        var pageSize = +localStorage.getItem("pim_check_apply_task_pageSize")
        this.queryInfo.pageSize = pageSize == 0 ? 7 : pageSize
        this.getTaskList()
    },
    computed: {
        ...mapState(['user']),
        ...mapState('apply', ['taskList'])
    },
    methods: {
        ...mapActions('apply', ['getTaskList']),
        // 打开审批对话框
        openApproveDialog(row) {
            const typeMap = {
                1: '临时事务',
                2: '技术研究',
                3: '微阶段'
            }
            this.approveObj = {
                id: row.id,
                type: row.type,
                typeText: typeMap[row.type] || '',
                applyName: row.applyName,
                applyId: row.applyId,
                description: row.description,
                estimatedWorkload: row.estimatedWorkload,
                planDays: row.planDays,
                createTime: row.createTime,
                comment: row.comment,
                status: null,
                checkUser: null
            }
            this.approveDialogVisible = true
        },
        // 提交审批（通过）
        async submitApprove() {
            const row = this.approveObj
            row.status = 1
            row.checkUser = this.user.id
            const res = await judgeApply(row)
            if (res.code === 200) {
                this.$message.success(res.data)
                this.approveDialogVisible = false
                this.getTaskList()
            } else {
                this.$message.error(res.msg)
            }
        },
        // 拒绝申请
        judgeApply(row, status) {
            if (status === 2) {
                this.$prompt('请输入拒绝理由', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(async ({ value }) => {
                    row.status = status
                    row.checkUser = this.user.id
                    row.comment = value
                    const res = await judgeApply(row)
                    if (res.code === 200) {
                        this.$message.success(res.data)
                        this.getTaskList()
                    } else {
                        this.$message.error(res.msg)
                    }
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消操作'
                    });
                });
            }
        },
        openHistory() {
            this.checkTaskHistoryVisible = true
            this.getApplyHistoryList()
        },
        async getApplyHistoryList() {
            const res = await applyHistoryList(this.queryInfo)
            if (res.code === 200) {
                this.applyHistoryList = res.data.records
                this.total = res.data.total
                this.applyHistoryList.forEach(item => item.predictTime = timeAdd(item.createTime, item.planDays))
                console.log(this.applyHistoryList)
            } else {
                this.$message.error(res.msg)
            }
        },
        handleSizeChange(value) {
            localStorage.setItem("pim_check_apply_task_pageSize", value)
            this.queryInfo.pageSize = value
            this.queryInfo.page = 1
            this.getApplyHistoryList()
        },
        handleCurrentChange(value) {
            this.queryInfo.page = value
            this.getApplyHistoryList()
        }
    }
}
</script>

<style scoped></style>